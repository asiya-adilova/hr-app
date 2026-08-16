import { NavLink } from 'react-router-dom';
import { routes } from '../../constants/routes.ts';
import { useAuth } from '../../features/auth/hooks/useAuth.ts';

export function Sidebar() {
  const { account } = useAuth();
  const employeeId = account?.employeeId;
  const isAdmin = account?.role === 'ADMIN';

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `block rounded-xl px-3 py-2 text-sm font-medium ${
      isActive ? 'bg-brand-50 text-brand-700' : 'text-ink-700 hover:bg-slate-50'
    }`;

  return (
    <aside className="flex w-64 flex-col border-r border-line bg-white p-5">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-700">
          HR
        </p>
        <h1 className="text-lg font-bold">
          {isAdmin ? 'Админ-панель' : 'Кабинет сотрудника'}
        </h1>
      </div>
      <nav className="space-y-1">
        {isAdmin ? (
          <>
            <NavLink to={routes.admin} end className={linkClass}>
              Главная
            </NavLink>
            <NavLink to={routes.adminEmployees} className={linkClass}>
              Сотрудники
            </NavLink>
            <NavLink to={routes.adminReferences} className={linkClass}>
              Справочники
            </NavLink>
          </>
        ) : (
          <>
            {employeeId ? (
              <NavLink
                to={routes.employeeDetails(employeeId)}
                className={linkClass}
              >
                Мой профиль
              </NavLink>
            ) : null}
            <NavLink
              to={
                employeeId
                  ? routes.editEmployee(employeeId)
                  : routes.createEmployee
              }
              className={linkClass}
            >
              {employeeId ? 'Редактировать анкету' : 'Заполнить анкету'}
            </NavLink>
          </>
        )}
      </nav>
    </aside>
  );
}
