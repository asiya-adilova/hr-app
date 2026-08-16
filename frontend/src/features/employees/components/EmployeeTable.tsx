import { Link } from 'react-router-dom';
import { Table } from '../../../components/ui/Table.tsx';
import { routes } from '../../../constants/routes.ts';
import { formatDate } from '../../../utils/date.ts';
import type { EmployeeTableItem } from '../types/employee.ts';

export function EmployeeTable({ rows }: { rows: EmployeeTableItem[] }) {
  return (
    <Table
      rows={rows}
      empty="Сотрудники не найдены"
      columns={[
        {
          key: 'number',
          header: 'Таб. №',
          render: (row) => row.employeeNumber,
        },
        {
          key: 'name',
          header: 'ФИО',
          render: (row) => row.fullName,
        },
        {
          key: 'department',
          header: 'Подразделение',
          render: (row) => row.departmentName,
        },
        {
          key: 'position',
          header: 'Должность',
          render: (row) => row.positionName,
        },
        {
          key: 'education',
          header: 'Образование',
          render: (row) => row.educationLevelName,
        },
        {
          key: 'hireDate',
          header: 'Приём',
          render: (row) => formatDate(row.hireDate),
        },
        {
          key: 'actions',
          header: '',
          render: (row) => (
            <div className="flex justify-end gap-3">
              <Link
                to={routes.employeeDetails(row.id)}
                className="text-sm font-medium text-brand-700"
              >
                Открыть
              </Link>
              <Link
                to={routes.editEmployee(row.id)}
                className="text-sm font-medium text-brand-700"
              >
                Изменить
              </Link>
            </div>
          ),
        },
      ]}
    />
  );
}
