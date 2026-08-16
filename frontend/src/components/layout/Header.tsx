import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button.tsx';
import { routes } from '../../constants/routes.ts';
import { useAuth } from '../../features/auth/hooks/useAuth.ts';

export function Header() {
  const { account, logout } = useAuth();
  const navigate = useNavigate();

  if (!account) {
    return null;
  }

  function onLogout() {
    logout();
    navigate(routes.login);
  }

  return (
    <header className="flex items-center justify-between border-b border-line bg-white px-6 py-4">
      <div>
        <p className="text-sm text-ink-500">
          {account.role === 'ADMIN' ? 'Администратор' : 'Добро пожаловать'}
        </p>
        <p className="font-semibold">
          {account.firstName} {account.lastName}
        </p>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-medium">{account.firstName}</p>
          <p className="text-xs text-ink-500">{account.email}</p>
        </div>
        <Button variant="secondary" onClick={onLogout}>
          Выйти
        </Button>
      </div>
    </header>
  );
}
