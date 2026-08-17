import { Drawer } from '../../../components/ui/Drawer.tsx';
import { useEmployees } from '../hooks/useEmployees.ts';
import { EmployeeAdminEditor } from './EmployeeAdminEditor.tsx';

type EmployeeDrawerProps = {
  open: boolean;
  employeeId: number | null;
  onClose: () => void;
  onSaved?: () => void;
};

export function EmployeeDrawer({
  open,
  employeeId,
  onClose,
  onSaved,
}: EmployeeDrawerProps) {
  const { employee, loading, error, reload } = useEmployees(employeeId);
  const title = employee
    ? `${employee.lastName} ${employee.firstName}`.trim()
    : 'Сотрудник';

  return (
    <Drawer open={open} title={title} onClose={onClose}>
      {loading && !employee ? (
        <p className="text-sm text-ink-500">Загружаем анкету...</p>
      ) : null}
      {error && !employee ? (
        <p className="text-sm text-rose-600">{error ?? 'Анкета не найдена'}</p>
      ) : null}
      {employee ? (
        <EmployeeAdminEditor employee={employee} onSaved={onSaved} onReload={reload} />
      ) : null}
    </Drawer>
  );
}
