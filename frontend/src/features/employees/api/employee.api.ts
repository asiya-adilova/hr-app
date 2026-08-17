import { apiRequest } from '../../../services/api-client.ts';
import type { PagedResult } from '../../../types/api.ts';
import type {
  CreateEmployeePayload,
  EducationItem,
  EmployeeDetails,
  EmployeeTableItem,
  RelativeItem,
  WorkExperienceItem,
} from '../types/employee.ts';
import type { EmployeeFilterPayload } from '../types/employee-filter.ts';

export const employeeApi = {
  getById(id: number) {
    return apiRequest<EmployeeDetails>(`/employees/${id}`);
  },

  getAll(pageIndex = 1, pageSize = 20) {
    return apiRequest<PagedResult<EmployeeTableItem>>(
      `/employees?pageIndex=${pageIndex}&pageSize=${pageSize}`,
    );
  },

  filter(filter: EmployeeFilterPayload, pageIndex = 1, pageSize = 20) {
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

  remove(id: number) {
    return apiRequest<void>(`/employees/${id}`, {
      method: 'DELETE',
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

  addEducation(
    employeeId: number,
    payload: Omit<EducationItem, 'id' | 'educationLevelName' | 'countryName' | 'cityName'>,
  ) {
    return apiRequest<EducationItem>(`/employees/${employeeId}/educations`, {
      method: 'POST',
      body: payload,
    });
  },

  addWorkExperience(
    employeeId: number,
    payload: Omit<WorkExperienceItem, 'id' | 'positionName' | 'countryName' | 'cityName'>,
  ) {
    return apiRequest<WorkExperienceItem>(
      `/employees/${employeeId}/work-experiences`,
      { method: 'POST', body: payload },
    );
  },

  updateWorkExperience(
    employeeId: number,
    id: number,
    payload: Omit<WorkExperienceItem, 'id' | 'positionName' | 'countryName' | 'cityName'>,
  ) {
    return apiRequest<WorkExperienceItem>(
      `/employees/${employeeId}/work-experiences/${id}`,
      { method: 'PUT', body: payload },
    );
  },

  deleteWorkExperience(employeeId: number, id: number) {
    return apiRequest<void>(`/employees/${employeeId}/work-experiences/${id}`, {
      method: 'DELETE',
    });
  },

  updateEducation(
    employeeId: number,
    id: number,
    payload: Omit<EducationItem, 'id' | 'educationLevelName' | 'countryName' | 'cityName'>,
  ) {
    return apiRequest<EducationItem>(`/employees/${employeeId}/educations/${id}`, {
      method: 'PUT',
      body: payload,
    });
  },

  deleteEducation(employeeId: number, id: number) {
    return apiRequest<void>(`/employees/${employeeId}/educations/${id}`, {
      method: 'DELETE',
    });
  },

  addRelative(employeeId: number, payload: Omit<RelativeItem, 'id'>) {
    return apiRequest<RelativeItem>(`/employees/${employeeId}/relatives`, {
      method: 'POST',
      body: payload,
    });
  },

  updateRelative(
    employeeId: number,
    id: number,
    payload: Omit<RelativeItem, 'id'>,
  ) {
    return apiRequest<RelativeItem>(`/employees/${employeeId}/relatives/${id}`, {
      method: 'PUT',
      body: payload,
    });
  },

  deleteRelative(employeeId: number, id: number) {
    return apiRequest<void>(`/employees/${employeeId}/relatives/${id}`, {
      method: 'DELETE',
    });
  },
};
