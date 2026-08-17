import { useRef, useState } from 'react';
import { Button } from '../../../components/ui/Button.tsx';
import { Input } from '../../../components/ui/Input.tsx';
import { Modal } from '../../../components/ui/Modal.tsx';
import { Pagination } from '../../../components/ui/Pagination.tsx';
import { Select } from '../../../components/ui/Select.tsx';
import { DEFAULT_PAGE_SIZE } from '../../../constants/pagination.ts';
import { ApiError } from '../../../services/api-client.ts';
import { useReferences } from '../../references/hooks/useReferences.ts';
import { employeeApi } from '../api/employee.api.ts';
import { EmployeeDrawer } from '../components/EmployeeDrawer.tsx';
import { EmployeeFilters } from '../components/EmployeeFilters.tsx';
import { EmployeeTable } from '../components/EmployeeTable.tsx';
import { useEmployeeList } from '../hooks/useEmployees.ts';
import {
  EMPLOYEE_SORT_OPTIONS,
  EmployeeFilterSort,
  type EmployeeFilter,
} from '../types/employee-filter.ts';
import type { EmployeeTableItem } from '../types/employee.ts';

export function EmployeesPage() {
  const { data: refs, loading: refsLoading } = useReferences();
  const [filter, setFilter] = useState<EmployeeFilter>({
    sortBy: EmployeeFilterSort.Newest,
  });
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [refreshToken, setRefreshToken] = useState(0);
  const [drawerId, setDrawerId] = useState<number | null>(null);
  const lastDrawerId = useRef(drawerId);
  if (drawerId) {
    lastDrawerId.current = drawerId;
  }
  const shownDrawerId = drawerId ?? lastDrawerId.current;
  const [pendingDelete, setPendingDelete] = useState<EmployeeTableItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const { rows, paging, loading, error } = useEmployeeList(
    filter,
    pageIndex,
    pageSize,
    refreshToken,
  );

  function updateFilter(next: EmployeeFilter) {
    setFilter(next);
    setPageIndex(1);
  }

  function updatePageSize(next: number) {
    setPageSize(next);
    setPageIndex(1);
  }

  function closeDeleteDialog() {
    if (deleting) {
      return;
    }
    setPendingDelete(null);
    setDeleteError(null);
  }

  async function confirmDelete() {
    if (!pendingDelete) {
      return;
    }

    setDeleting(true);
    setDeleteError(null);

    try {
      await employeeApi.remove(pendingDelete.id);
      if (drawerId === pendingDelete.id) {
        setDrawerId(null);
      }
      setPendingDelete(null);
      if (rows.length === 1 && pageIndex > 1) {
        setPageIndex((page) => page - 1);
      } else {
        setRefreshToken((token) => token + 1);
      }
    } catch (caught) {
      setDeleteError(
        caught instanceof ApiError ? caught.message : 'Не удалось удалить сотрудника',
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:gap-6">
      {refsLoading ? (
        <aside className="rounded-2xl border border-line bg-white p-4 text-sm text-ink-500 lg:w-72">
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
          <div className="flex w-full min-w-0 flex-col gap-2 sm:max-w-2xl sm:flex-row">
            <div className="min-w-0 flex-1">
              <Input
                placeholder="Поиск по ФИО, табельному номеру, ПИНФЛ, телефону, email, серии и номеру паспорта"
                title="Поиск по ФИО, табельному номеру, ПИНФЛ, телефону, email, серии и номеру паспорта"
                value={filter.searchTerm ?? ''}
                onChange={(event) =>
                  updateFilter({ ...filter, searchTerm: event.target.value })
                }
              />
            </div>
            <div className="sm:w-56">
              <Select
                placeholder=""
                value={filter.sortBy ?? EmployeeFilterSort.Newest}
                options={EMPLOYEE_SORT_OPTIONS}
                onChange={(event) =>
                  updateFilter({
                    ...filter,
                    sortBy: Number(event.target.value) as EmployeeFilterSort,
                  })
                }
              />
            </div>
          </div>
        </div>

        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        {loading ? (
          <p className="text-sm text-ink-500">Загружаем список...</p>
        ) : (
          <EmployeeTable
            rows={rows}
            startNumber={(pageIndex - 1) * pageSize + 1}
            onView={(id) => setDrawerId(id)}
            onDelete={(row) => {
              setDeleteError(null);
              setPendingDelete(row);
            }}
          />
        )}
        <Pagination
          pageIndex={paging.pageIndex}
          pageSize={pageSize}
          totalPages={paging.totalPages}
          totalCount={paging.totalCount}
          onChange={setPageIndex}
          onPageSizeChange={updatePageSize}
        />
      </div>

      <EmployeeDrawer
        open={Boolean(drawerId)}
        employeeId={shownDrawerId}
        onClose={() => setDrawerId(null)}
        onSaved={() => setRefreshToken((token) => token + 1)}
      />

      <Modal
        open={Boolean(pendingDelete)}
        title="Удаление сотрудника"
        showClose={false}
        onClose={closeDeleteDialog}
        footer={
          <>
            <Button variant="secondary" disabled={deleting} onClick={closeDeleteDialog}>
              Отмена
            </Button>
            <Button variant="danger" disabled={deleting} onClick={() => void confirmDelete()}>
              {deleting ? 'Удаляем...' : 'Удалить'}
            </Button>
          </>
        }
      >
        <p className="text-sm text-ink-700">
          Вы уверены, что хотите удалить сотрудника{' '}
          <span className="font-semibold">{pendingDelete?.fullName}</span>?
        </p>
        {deleteError ? <p className="mt-3 text-sm text-rose-600">{deleteError}</p> : null}
      </Modal>
    </div>
  );
}
