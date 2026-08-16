import { Navigate, Outlet } from 'react-router-dom';
import { homePath, routes } from '../constants/routes.ts';
import { useAuth } from '../features/auth/hooks/useAuth.ts';

export function GuestOnly() {
  const { account, loading } = useAuth();

  if (loading) {
    return <p className="p-8 text-ink-500">Загрузка...</p>;
  }

  if (account) {
    return <Navigate to={homePath(account.role, account.employeeId)} replace />;
  }

  return <Outlet />;
}

export function RequireAuth() {
  const { account, loading } = useAuth();

  if (loading) {
    return <p className="p-8 text-ink-500">Загрузка...</p>;
  }

  if (!account) {
    return <Navigate to={routes.login} replace />;
  }

  return <Outlet />;
}

export function RequireAdmin() {
  const { account } = useAuth();

  if (account?.role !== 'ADMIN') {
    return <Navigate to={homePath(account?.role, account?.employeeId)} replace />;
  }

  return <Outlet />;
}

export function HomeRedirect() {
  const { account } = useAuth();
  return <Navigate to={homePath(account?.role, account?.employeeId)} replace />;
}
