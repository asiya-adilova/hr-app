import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { authApi } from '../api/auth.api.ts';
import type { Account, LoginPayload, RegisterPayload } from '../types/auth.ts';
import { clearTokens, getAccessToken } from '../../../services/api-client.ts';
import { AuthContext } from './auth-context.ts';

const ACCOUNT_KEY = 'hr.account';

function readStoredAccount(): Account | null {
  const raw = localStorage.getItem(ACCOUNT_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as Account;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [account, setAccountState] = useState<Account | null>(readStoredAccount);
  const [loading, setLoading] = useState(() => Boolean(getAccessToken()));

  const setAccount = useCallback((next: Account) => {
    localStorage.setItem(ACCOUNT_KEY, JSON.stringify(next));
    setAccountState(next);
  }, []);

  const logout = useCallback(() => {
    clearTokens();
    localStorage.removeItem(ACCOUNT_KEY);
    setAccountState(null);
  }, []);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      return;
    }

    authApi
      .me()
      .then(setAccount)
      .catch(() => {
        logout();
      })
      .finally(() => setLoading(false));
  }, [logout, setAccount]);

  const login = useCallback(
    async (payload: LoginPayload) => {
      const response = await authApi.login(payload);
      authApi.persistSession(response);
      setAccount(response.account);
      return response.account;
    },
    [setAccount],
  );

  const register = useCallback(
    async (payload: RegisterPayload) => {
      const response = await authApi.register(payload);
      authApi.persistSession(response);
      setAccount(response.account);
      return response.account;
    },
    [setAccount],
  );

  const value = useMemo(
    () => ({ account, loading, login, register, logout, setAccount }),
    [account, loading, login, register, logout, setAccount],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
