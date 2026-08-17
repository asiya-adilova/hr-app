import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button.tsx';
import { routes } from '../../constants/routes.ts';
import { useAuth } from '../../features/auth/hooks/useAuth.ts';

type HeaderProps = {
  onMenuClick?: () => void;
};

export function Header({ onMenuClick }: HeaderProps) {
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
    <header className="flex items-center gap-3 border-b border-line bg-white px-4 py-3 md:px-6 md:py-4">
      <button
        type="button"
        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-line text-ink-700 lg:hidden"
        aria-label="Открыть меню"
        onClick={onMenuClick}
      >
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      </button>

      <div className="min-w-0 flex-1">
        <p className="text-xs text-ink-500 md:text-sm">
          {account.role === 'ADMIN' ? 'Администратор' : 'Добро пожаловать'}
        </p>
        <p className="truncate font-semibold">
          {account.firstName} {account.lastName}
        </p>
      </div>

      <div className="hidden min-w-0 text-right sm:block">
        <p className="truncate text-sm font-medium">{account.firstName}</p>
        <p className="truncate text-xs text-ink-500">{account.email}</p>
      </div>
      <Button variant="secondary" className="shrink-0 px-3 md:px-4" onClick={onLogout}>
        Выйти
      </Button>
    </header>
  );
}
