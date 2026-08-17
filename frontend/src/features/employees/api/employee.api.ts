import { apiRequest } from '../../../services/api-client.ts';
import type { PagedResult } from '../../../types/api.ts';
import type {
  CreateEmployeePayload,
  EducationItem,
  EmployeeDetails,
  EmployeeTableItem,
  WorkExperienceItem,
} from '../types/employee.ts';
import type { EmployeeFilter } from '../types/employee-filter.ts';

export const employeeApi = {
  getById(id: number) {
    return apiRequest<EmployeeDetails>(`/employees/${id}`);
  },

  getAll(pageIndex = 1, pageSize = 20) {
    return apiRequest<PagedResult<EmployeeTableItem>>(
      `/employees?pageIndex=${pageIndex}&pageSize=${pageSize}`,
    );
  },

  filter(filter: EmployeeFilter, pageIndex = 1, pageSize = 20) {
    return apiRequest<PagedResult<EmployeeTableItem>>(
      `/employees/filter?pageIndex=${pageIndex}&pageSize=${pageSize}`,
      { method: 'POST', body: filter },
    );
  },

  create(payload: CreateEmployeePayload) {
    return apiRequest<EmployeeDetails>('/employees', {
      method: 'POST',
      body: payload,
    });
  },

  update(id: number, payload: Partial<CreateEmployeePayload>) {
    return apiRequest<EmployeeDetails>(`/employees/${id}`, {
      method: 'PUT',
      body: payload,
    });
  },

  replaceEducations(employeeId: number, items: Array<Omit<EducationItem, 'id'>>) {
    return apiRequest<EducationItem[]>(`/employees/${employeeId}/educations`, {
      method: 'PUT',
      body: { items },
    });
  },

  replaceWorkExperiences(
    employeeId: number,
    items: Array<Omit<WorkExperienceItem, 'id'>>,
  ) {
    return apiRequest<WorkExperienceItem[]>(
      `/employees/${employeeId}/work-experiences`,
      { method: 'PUT', body: { items } },
    );
  },

  addEducation(employeeId: number, payload: Omit<EducationItem, 'id'>) {
    return apiRequest<EducationItem>(`/employees/${employeeId}/educations`, {
      method: 'POST',
      body: payload,
    });
  },

  addWorkExperience(
    employeeId: number,
    payload: Omit<WorkExperienceItem, 'id'>,
  ) {
    return apiRequest<WorkExperienceItem>(
      `/employees/${employeeId}/work-experiences`,
      { method: 'POST', body: payload },
    );
  },
};
