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

  useEffect(() => {
    if (!employeeId) {
      return;
    }

    let active = true;

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
  }, [employeeId]);

  return { employee, loading, error };
}

const emptyPaging: PageInfo = {
  pageIndex: 1,
  pageSize: 10,
  totalCount: 0,
  totalPages: 1,
};

export function useEmployeeList(filter: EmployeeFilter, pageIndex: number) {
  const [rows, setRows] = useState<EmployeeTableItem[]>([]);
  const [paging, setPaging] = useState<PageInfo>(emptyPaging);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    employeeApi
      .filter(compactEmployeeFilter(filter), pageIndex, 10)
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
  }, [filter, pageIndex]);

  return { rows, paging, loading, error };
}
