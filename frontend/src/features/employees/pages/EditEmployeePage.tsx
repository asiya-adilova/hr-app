import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { routes } from '../../../constants/routes.ts';
import { ApiError } from '../../../services/api-client.ts';
import { useAuth } from '../../auth/hooks/useAuth.ts';
import { EmployeeForm } from '../components/EmployeeForm.tsx';
import { saveEmployeeFormStep } from '../helpers/save-employee-form-step.ts';
import { useEmployees } from '../hooks/useEmployees.ts';

export function EditEmployeePage() {
  const params = useParams();
  const id = Number(params.id);
  const { account } = useAuth();
  const navigate = useNavigate();
  const { employee, loading, error } = useEmployees(Number.isFinite(id) ? id : null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  if (loading) {
    return <p className="text-ink-500">Загружаем анкету...</p>;
  }

  if (error || !employee || !account) {
    return <p className="text-rose-600">{error ?? 'Анкета не найдена'}</p>;
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <p className="text-sm font-semibold text-brand-700">Анкета</p>
        <h1 className="text-2xl font-bold">Редактирование</h1>
        <p className="mt-1 text-sm text-ink-500">
          Каждый шаг сохраняется автоматически при переходе дальше.
        </p>
      </div>
      <EmployeeForm
        accountId={employee.accountId}
        employeeNumberHint={employee.employeeNumber}
        initial={employee}
        submitting={submitting}
        error={submitError}
        onComplete={() => navigate(routes.employeeDetails(employee.id))}
        onSaveStep={async (step, { employee: payload }) => {
          setSubmitting(true);
          setSubmitError(null);
          try {
            await saveEmployeeFormStep(employee.id, step, payload);
          } catch (caught) {
            setSubmitError(
              caught instanceof ApiError ? caught.message : 'Не удалось сохранить',
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
