import { useEffect, useState } from 'react';
import { employeeApi } from '../api/employee.api.ts';
import type { EmployeeDetails } from '../types/employee.ts';

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
