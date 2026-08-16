import type { ReactNode } from 'react';
import { AuthProvider } from '../features/auth/hooks/AuthProvider.tsx';

export function Providers({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
