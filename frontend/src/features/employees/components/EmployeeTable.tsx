import { Table } from '../../../components/ui/Table.tsx';
import { formatDate } from '../../../utils/date.ts';
import { formatLocation } from './CountryCityFields.tsx';
import { formatExperienceMonths } from '../helpers/format-experience.ts';
import type { EmployeeTableItem } from '../types/employee.ts';

type EmployeeTableProps = {
  rows: EmployeeTableItem[];
  onView: (id: number) => void;
  onDelete: (row: EmployeeTableItem) => void;
};

export function EmployeeTable({ rows, onView, onDelete }: EmployeeTableProps) {
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
          key: 'location',
          header: 'Локация',
          render: (row) =>
            formatLocation(row.cityName, row.countryName) || '—',
        },
        {
          key: 'phone',
          header: 'Телефон',
          render: (row) => row.phone || '—',
        },
        {
          key: 'experience',
          header: 'Стаж по специальности',
          render: (row) => formatExperienceMonths(row.specialtyExperienceMonths),
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
            <div className="flex justify-end gap-1">
              <button
                type="button"
                className="rounded-lg p-1.5 text-brand-700 transition hover:bg-brand-50"
                aria-label="Открыть"
                onClick={() => onView(row.id)}
              >
                <EyeIcon />
              </button>
              <button
                type="button"
                className="rounded-lg p-1.5 text-rose-600 transition hover:bg-rose-50"
                aria-label="Удалить"
                onClick={() => onDelete(row)}
              >
                <TrashIcon />
              </button>
            </div>
          ),
        },
      ]}
    />
  );
}

function EyeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 7h16" />
      <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
      <path d="M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  );
}
