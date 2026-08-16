import { Link } from 'react-router-dom';
import { routes } from '../../../constants/routes.ts';

export function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-brand-700">Админ-панель</p>
        <h1 className="text-2xl font-bold">Главная</h1>
        <p className="mt-1 text-sm text-ink-500">
          Управление сотрудниками и статическими справочниками.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Link
          to={routes.adminEmployees}
          className="rounded-2xl border border-line bg-white p-6 hover:border-brand-500"
        >
          <h2 className="text-lg font-semibold">Сотрудники</h2>
          <p className="mt-2 text-sm text-ink-500">
            Таблица с фильтрами слева, поиском и пагинацией. Можно открыть и изменить анкету.
          </p>
        </Link>
        <Link
          to={routes.adminReferences}
          className="rounded-2xl border border-line bg-white p-6 hover:border-brand-500"
        >
          <h2 className="text-lg font-semibold">Справочники</h2>
          <p className="mt-2 text-sm text-ink-500">
            Гражданство, категории прав, подразделения, должности и остальные справочные таблицы.
          </p>
        </Link>
      </div>
    </div>
  );
}
