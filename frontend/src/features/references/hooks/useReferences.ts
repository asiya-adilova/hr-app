import { useEffect, useState } from 'react';
import { referencesApi } from '../api/references.api.ts';
import type { ReferenceMap } from '../types/references.ts';

const empty: ReferenceMap = {
  genders: [],
  citizenships: [],
  nationalities: [],
  departments: [],
  positions: [],
  employmentTypes: [],
  educationLevels: [],
  maritalStatuses: [],
  driverLicenseCategories: [],
};

export function useReferences() {
  const [data, setData] = useState<ReferenceMap>(empty);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    referencesApi
      .getAll()
      .then((result) => {
        if (active) {
          setData(result);
        }
      })
      .catch((caught: unknown) => {
        if (active) {
          setError(
            caught instanceof Error ? caught.message : 'Не удалось загрузить справочники',
          );
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
  }, []);

  return { data, loading, error };
}
