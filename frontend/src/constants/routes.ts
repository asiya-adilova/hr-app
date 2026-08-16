export const routes = {
  login: '/login',
  register: '/register',
  home: '/',
  employees: '/employees',
  createEmployee: '/employees/new',
  employeeDetails: (id: number | string) => `/employees/${id}`,
  editEmployee: (id: number | string) => `/employees/${id}/edit`,
} as const;

export function homePath(role?: string, employeeId?: number | null): string {
  if (role === 'ADMIN') {
    return routes.employees;
  }

  if (employeeId) {
    return routes.employeeDetails(employeeId);
  }

  return routes.createEmployee;
}
