import { Link, useParams } from 'react-router-dom';
import { Button } from '../../../components/ui/Button.tsx';
import { routes } from '../../../constants/routes.ts';
import { useAuth } from '../../auth/hooks/useAuth.ts';
import { EmployeeDetails } from '../components/EmployeeDetails.tsx';
import { useEmployees } from '../hooks/useEmployees.ts';

export function EmployeeDetailsPage() {
  const params = useParams();
  const { account } = useAuth();
  const id = Number(params.id);
  const { employee, loading, error } = useEmployees(Number.isFinite(id) ? id : null);

  if (loading) {
    return <p className="text-ink-500">Загружаем профиль...</p>;
  }

  if (error || !employee) {
    return <p className="text-rose-600">{error ?? 'Профиль не найден'}</p>;
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          {account?.role === 'ADMIN' ? (
            <Link to={routes.adminEmployees} className="text-sm text-brand-700">
              ← К списку сотрудников
            </Link>
          ) : null}
          <p className="text-sm font-semibold text-brand-700">Профиль</p>
          <h1 className="text-2xl font-bold">
            {employee.firstName} {employee.lastName}
          </h1>
        </div>
        <Link to={routes.editEmployee(employee.id)}>
          <Button variant="secondary">Редактировать</Button>
        </Link>
      </div>
      <EmployeeDetails employee={employee} />
    </div>
  );
}
