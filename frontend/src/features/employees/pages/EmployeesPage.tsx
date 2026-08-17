import { useState } from 'react';
import { Input } from '../../../components/ui/Input.tsx';
import { Pagination } from '../../../components/ui/Pagination.tsx';
import { useReferences } from '../../references/hooks/useReferences.ts';
import { EmployeeFilters } from '../components/EmployeeFilters.tsx';
import { EmployeeTable } from '../components/EmployeeTable.tsx';
import { useEmployeeList } from '../hooks/useEmployees.ts';
import type { EmployeeFilter } from '../types/employee-filter.ts';

export function EmployeesPage() {
  const { data: refs, loading: refsLoading } = useReferences();
  const [filter, setFilter] = useState<EmployeeFilter>({});
  const [pageIndex, setPageIndex] = useState(1);
  const { rows, paging, loading, error } = useEmployeeList(filter, pageIndex);

  function updateFilter(next: EmployeeFilter) {
    setFilter(next);
    setPageIndex(1);
  }

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:gap-6">
      {refsLoading ? (
        <aside className="rounded-2xl border border-line bg-white p-4 text-sm text-ink-500 lg:w-64">
          Загружаем фильтры...
        </aside>
      ) : (
        <EmployeeFilters
          value={filter}
          onChange={updateFilter}
          options={refs}
        />
      )}

      <div className="min-w-0 flex-1 space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-brand-700">Админ-панель</p>
            <h1 className="text-2xl font-bold">Сотрудники</h1>
          </div>
          <div className="w-full sm:max-w-72">
            <Input
              placeholder="Поиск по имени, email, ПИНФЛ"
              value={filter.searchTerm ?? ''}
              onChange={(event) =>
                updateFilter({ ...filter, searchTerm: event.target.value })
              }
            />
          </div>
        </div>

        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        {loading ? (
          <p className="text-sm text-ink-500">Загружаем список...</p>
        ) : (
          <EmployeeTable rows={rows} />
        )}
        <Pagination
          pageIndex={paging.pageIndex}
          totalPages={paging.totalPages}
          totalCount={paging.totalCount}
          onChange={setPageIndex}
        />
      </div>
    </div>
  );
}
