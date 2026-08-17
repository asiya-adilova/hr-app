import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { routes } from '../../../constants/routes.ts';
import { ApiError } from '../../../services/api-client.ts';
import { useAuth } from '../../auth/hooks/useAuth.ts';
import { employeeApi } from '../api/employee.api.ts';
import { EmployeeForm } from '../components/EmployeeForm.tsx';
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
        onSaveStep={async (step, { employee: payload, educations, workExperiences }) => {
          setSubmitting(true);
          setSubmitError(null);
          try {
            const updatePayload: Partial<typeof payload> = { ...payload };
            delete updatePayload.accountId;
            delete updatePayload.militaryService;
            delete updatePayload.hasDriverLicense;
            delete updatePayload.driverLicenseCategoryId;
            delete updatePayload.additionalInfo;
            delete updatePayload.educationLevelId;

            if (step === 0 || step === 1) {
              await employeeApi.update(employee.id, {
                ...updatePayload,
                formStep: step + 1,
              });
            }

            if (step === 2) {
              await employeeApi.replaceWorkExperiences(employee.id, workExperiences);
              await employeeApi.update(employee.id, { formStep: 3 });
            }

            if (step === 3) {
              await employeeApi.replaceEducations(employee.id, educations);
              await employeeApi.update(employee.id, {
                educationLevelId: payload.educationLevelId,
                formStep: 4,
              });
            }

            if (step === 4) {
              await employeeApi.update(employee.id, {
                militaryService: payload.militaryService,
                hasDriverLicense: payload.hasDriverLicense,
                driverLicenseCategoryId: payload.hasDriverLicense
                  ? payload.driverLicenseCategoryId
                  : undefined,
                additionalInfo: payload.additionalInfo,
                formStep: 5,
              });
            }
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
