import { useEffect, useState } from 'react';
import { employeeApi } from '../api/employee.api.ts';
import type { EmployeeDetails, EmployeeTableItem } from '../types/employee.ts';
import {
  compactEmployeeFilter,
  type EmployeeFilter,
} from '../types/employee-filter.ts';
import type { PageInfo } from '../../../types/api.ts';

export function useEmployees(employeeId?: number | null) {
  const [employee, setEmployee] = useState<EmployeeDetails | null>(null);
  const [loading, setLoading] = useState(Boolean(employeeId));
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    if (!employeeId) {
      setEmployee(null);
      setLoading(false);
      setError(null);
      return;
    }

    let active = true;
    setEmployee((current) => (current?.id === employeeId ? current : null));
    setLoading(true);
    setError(null);

    employeeApi
      .getById(employeeId)
      .then((result) => {
        if (active) {
          setEmployee(result);
        }
      })
      .catch((caught: unknown) => {
        if (active) {
          setError(caught instanceof Error ? caught.message : 'Не удалось загрузить');
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [employeeId, reloadToken]);

  function reload() {
    setReloadToken((token) => token + 1);
  }

  return { employee, loading, error, reload };
}

const emptyPaging: PageInfo = {
  pageIndex: 1,
  pageSize: 10,
  totalCount: 0,
  totalPages: 1,
};

export function useEmployeeList(
  filter: EmployeeFilter,
  pageIndex: number,
  pageSize: number,
  refreshToken = 0,
) {
  const [rows, setRows] = useState<EmployeeTableItem[]>([]);
  const [paging, setPaging] = useState<PageInfo>(emptyPaging);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    employeeApi
      .filter(compactEmployeeFilter(filter), pageIndex, pageSize)
      .then((result) => {
        if (!active) {
          return;
        }
        setRows(result.data);
        setPaging(result.paging);
      })
      .catch((caught: unknown) => {
        if (active) {
          setError(caught instanceof Error ? caught.message : 'Не удалось загрузить');
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [filter, pageIndex, pageSize, refreshToken]);

  return { rows, paging, loading, error };
}
