import { Input } from '../../../components/ui/Input.tsx';
import type { EmployeeFilter } from '../types/employee-filter.ts';

export function EmployeeFilters({
  value,
  onChange,
}: {
  value: EmployeeFilter;
  onChange: (value: EmployeeFilter) => void;
}) {
  return (
    <div className="max-w-sm">
      <Input
        label="Поиск"
        value={value.searchTerm ?? ''}
        placeholder="Имя, email, ПИНФЛ"
        onChange={(event) => onChange({ ...value, searchTerm: event.target.value })}
      />
    </div>
  );
}
