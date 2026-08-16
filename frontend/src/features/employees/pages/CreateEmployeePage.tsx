import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { routes } from '../../../constants/routes.ts';
import { ApiError } from '../../../services/api-client.ts';
import { useAuth } from '../../auth/hooks/useAuth.ts';
import { employeeApi } from '../api/employee.api.ts';
import { EmployeeForm } from '../components/EmployeeForm.tsx';

export function CreateEmployeePage() {
  const { account, setAccount } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!account) {
    return null;
  }

  if (account.employeeId) {
    return <Navigate to={routes.employeeDetails(account.employeeId)} replace />;
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <p className="text-sm font-semibold text-brand-700">Анкета</p>
        <h1 className="text-2xl font-bold">Регистрация сотрудника</h1>
        <p className="mt-1 text-sm text-ink-500">
          Заполните шаги по очереди. Образование и опыт работы можно добавить сразу или позже.
        </p>
      </div>
      <EmployeeForm
        accountId={account.id}
        employeeNumberHint={`EMP-${account.id}`}
        submitting={submitting}
        error={error}
        onSubmit={async ({ employee, educations, workExperiences }) => {
          setSubmitting(true);
          setError(null);
          try {
            const created = await employeeApi.create(employee);
            await Promise.all([
              ...educations.map((item) => employeeApi.addEducation(created.id, item)),
              ...workExperiences.map((item) =>
                employeeApi.addWorkExperience(created.id, item),
              ),
            ]);
            setAccount({ ...account, employeeId: created.id });
            navigate(routes.employeeDetails(created.id));
          } catch (caught) {
            setError(
              caught instanceof ApiError ? caught.message : 'Не удалось сохранить анкету',
            );
          } finally {
            setSubmitting(false);
          }
        }}
      />
    </div>
  );
}
