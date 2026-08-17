import { employeeApi } from '../api/employee.api.ts';
import type { CreateEmployeePayload } from '../types/employee.ts';

export async function saveEmployeeFormStep(
  employeeId: number,
  step: number,
  payload: CreateEmployeePayload,
) {
  const updatePayload: Partial<CreateEmployeePayload> = { ...payload };
  delete updatePayload.accountId;
  delete updatePayload.militaryService;
  delete updatePayload.hasDriverLicense;
  delete updatePayload.driverLicenseCategoryId;
  delete updatePayload.additionalInfo;

  if (step === 0 || step === 1) {
    await employeeApi.update(employeeId, {
      ...updatePayload,
      formStep: step + 1,
    });
  }

  if (step === 2) {
    await employeeApi.update(employeeId, { formStep: 3 });
  }

  if (step === 3) {
    await employeeApi.update(employeeId, { formStep: 4 });
  }

  if (step === 4) {
    await employeeApi.update(employeeId, {
      militaryService: payload.militaryService,
      hasDriverLicense: payload.hasDriverLicense,
      driverLicenseCategoryId: payload.hasDriverLicense
        ? payload.driverLicenseCategoryId
        : undefined,
      additionalInfo: payload.additionalInfo,
      formStep: 5,
    });
  }
}
