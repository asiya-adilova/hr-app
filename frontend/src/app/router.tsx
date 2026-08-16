import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout.tsx';
import { routes } from '../constants/routes.ts';
import { LoginPage } from '../features/auth/pages/LoginPage.tsx';
import { RegisterPage } from '../features/auth/pages/RegisterPage.tsx';
import { CreateEmployeePage } from '../features/employees/pages/CreateEmployeePage.tsx';
import { EditEmployeePage } from '../features/employees/pages/EditEmployeePage.tsx';
import { EmployeeDetailsPage } from '../features/employees/pages/EmployeeDetailsPage.tsx';
import { EmployeesPage } from '../features/employees/pages/EmployeesPage.tsx';
import { GuestOnly, HomeRedirect, RequireAuth } from './guards.tsx';

export const router = createBrowserRouter([
  {
    element: <GuestOnly />,
    children: [
      { path: routes.login, element: <LoginPage /> },
      { path: routes.register, element: <RegisterPage /> },
    ],
  },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: routes.home, element: <HomeRedirect /> },
          { path: routes.employees, element: <EmployeesPage /> },
          { path: routes.createEmployee, element: <CreateEmployeePage /> },
          { path: '/employees/:id', element: <EmployeeDetailsPage /> },
          { path: '/employees/:id/edit', element: <EditEmployeePage /> },
        ],
      },
    ],
  },
]);
