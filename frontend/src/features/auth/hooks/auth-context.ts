import { createContext } from 'react';
import type { Account, LoginPayload, RegisterPayload } from '../types/auth.ts';

export type AuthContextValue = {
  account: Account | null;
  loading: boolean;
  login: (payload: LoginPayload) => Promise<Account>;
  register: (payload: RegisterPayload) => Promise<Account>;
  logout: () => void;
  setAccount: (account: Account) => void;
};

export const AuthContext = createContext<AuthContextValue | null>(null);
