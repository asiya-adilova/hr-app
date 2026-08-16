import { Table } from '../../../components/ui/Table.tsx';
import type { EmployeeTableItem } from '../types/employee.ts';

export function EmployeeTable({ rows }: { rows: EmployeeTableItem[] }) {
  return (
    <Table
      rows={rows}
      empty="Сотрудники появятся здесь на следующем этапе"
      columns={[
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
      ]}
    />
  );
}
