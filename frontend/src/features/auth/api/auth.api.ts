import { apiRequest, saveTokens } from '../../../services/api-client.ts';
import type {
  Account,
  AuthResponse,
  LoginPayload,
  RegisterPayload,
} from '../types/auth.ts';

export const authApi = {
  login(payload: LoginPayload) {
    return apiRequest<AuthResponse>('/security/login', {
      method: 'POST',
      body: payload,
      auth: false,
    });
  },

  register(payload: RegisterPayload) {
    return apiRequest<AuthResponse>('/security/register', {
      method: 'POST',
      body: payload,
      auth: false,
    });
  },

  me() {
    return apiRequest<Account>('/security/me');
  },

  persistSession(response: AuthResponse) {
    saveTokens(response.accessToken, response.refreshToken);
  },
};
