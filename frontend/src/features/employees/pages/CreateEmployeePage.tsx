import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { routes } from '../../../constants/routes.ts';
import { ApiError } from '../../../services/api-client.ts';
import { useAuth } from '../../auth/hooks/useAuth.ts';
import { employeeApi } from '../api/employee.api.ts';
import { EmployeeForm } from '../components/EmployeeForm.tsx';

export function CreateEmployeePage() {
  const { account, setAccount } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!account) {
    return null;
  }

  if (account.employeeId) {
    return <Navigate to={routes.editEmployee(account.employeeId)} replace />;
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <p className="text-sm font-semibold text-brand-700">Анкета</p>
        <h1 className="text-2xl font-bold">Регистрация сотрудника</h1>
        <p className="mt-1 text-sm text-ink-500">
          Каждый шаг сохраняется. Если обновить страницу, уже заполненные данные останутся.
        </p>
      </div>
      <EmployeeForm
        accountId={account.id}
        employeeNumberHint={`EMP-${account.id}`}
        submitting={submitting}
        error={error}
        onSaveStep={async (step, { employee }) => {
          setSubmitting(true);
          setError(null);
          try {
            if (step !== 0) {
              throw new Error('Сначала сохраните контактные данные');
            }

            const created = await employeeApi.create({
              ...employee,
              formStep: 1,
            });
            setAccount({ ...account, employeeId: created.id });
            return false;
          } catch (caught) {
            setError(
              caught instanceof ApiError ? caught.message : 'Не удалось сохранить шаг',
            );
            throw caught;
          } finally {
            setSubmitting(false);
          }
        }}
      />
    </div>
  );
}
