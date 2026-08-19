import type { ApiResponse } from '../types/api.ts';

const ACCESS_TOKEN_KEY = 'hr.accessToken';
const REFRESH_TOKEN_KEY = 'hr.refreshToken';

export class ApiError extends Error {
  code?: number;
  status?: number;

  constructor(message: string, code?: number, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
  }
}

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function saveTokens(accessToken: string, refreshToken: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function clearTokens(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
  auth?: boolean;
  skipRefresh?: boolean;
};

let refreshPromise: Promise<boolean> | null = null;

function firstValidationMessage(
  validationErrors?: string[] | Record<string, string[]>,
): string | undefined {
  if (Array.isArray(validationErrors)) {
    return validationErrors[0];
  }

  if (validationErrors) {
    return Object.values(validationErrors).flat()[0];
  }

  return undefined;
}

async function parseResponse<T>(response: Response): Promise<T> {
  let payload: ApiResponse<T> | undefined;

  try {
    payload = (await response.json()) as ApiResponse<T>;
  } catch {
    throw new ApiError('Ошибка запроса', undefined, response.status);
  }

  if (!response.ok || payload?.successful === false) {
    throw new ApiError(
      firstValidationMessage(payload?.error?.validationErrors) ??
        payload?.error?.message ??
        'Ошибка запроса',
      payload?.error?.code,
      response.status,
    );
  }

  return (payload?.data ?? payload) as T;
}

async function tryRefresh(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    return false;
  }

  try {
    const response = await fetchWithRetry(`${API_URL}/security/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    const data = await parseResponse<{
      accessToken: string;
      refreshToken: string;
    }>(response);
    saveTokens(data.accessToken, data.refreshToken);
    return true;
  } catch {
    clearTokens();
    return false;
  }
}

function isNetworkError(error: unknown): boolean {
  return error instanceof TypeError;
}

function toNetworkError(error: unknown): ApiError {
  const message =
    error instanceof Error && error.message && error.message !== 'Failed to fetch'
      ? error.message
      : 'Не удалось подключиться к серверу';
  return new ApiError(message);
}

async function fetchWithRetry(url: string, init: RequestInit): Promise<Response> {
  const delays = [400, 1000];
  let lastError: unknown;

  for (let attempt = 0; attempt <= delays.length; attempt += 1) {
    try {
      return await fetch(url, init);
    } catch (error) {
      lastError = error;
      if (!isNetworkError(error) || attempt === delays.length) {
        throw toNetworkError(error);
      }
      await new Promise((resolve) => setTimeout(resolve, delays[attempt]));
    }
  }

  throw toNetworkError(lastError);
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { body, auth = true, skipRefresh = false, headers, ...rest } = options;
  const token = getAccessToken();

  const response = await fetchWithRetry(`${API_URL}${path}`, {
    ...rest,
    headers: {
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(auth && token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (response.status === 401 && auth && !skipRefresh) {
    refreshPromise ??= tryRefresh().finally(() => {
      refreshPromise = null;
    });
    const refreshed = await refreshPromise;
    if (refreshed) {
      return apiRequest<T>(path, { ...options, skipRefresh: true });
    }
  }

  return parseResponse<T>(response);
}
