import { Link } from 'react-router-dom';
import { routes } from '../../constants/routes.ts';

export function PublicNav() {
  return (
    <header className="mb-8 flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm font-semibold text-brand-700">HR Portal</p>
      <nav className="flex gap-4 text-sm font-medium">
        <Link to={routes.home} className="text-ink-700">
          Главная
        </Link>
        <Link to={routes.login} className="text-brand-700">
          Вход
        </Link>
      </nav>
    </header>
  );
}
