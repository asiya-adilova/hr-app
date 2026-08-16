export const routes = {
  login: '/login',
  register: '/register',
  home: '/',
  admin: '/admin',
  adminEmployees: '/admin/employees',
  adminReferences: '/admin/references',
  adminReference: (type: string) => `/admin/references/${type}`,
  employees: '/employees',
  createEmployee: '/employees/new',
  employeeDetails: (id: number | string) => `/employees/${id}`,
  editEmployee: (id: number | string) => `/employees/${id}/edit`,
} as const;

export function homePath(role?: string, employeeId?: number | null): string {
  if (role === 'ADMIN') {
    return routes.admin;
  }

  if (employeeId) {
    return routes.employeeDetails(employeeId);
  }

  return routes.createEmployee;
}
