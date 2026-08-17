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
  countries: [],
  cities: [],
};

export function useReferences() {
  const [data, setData] = useState<ReferenceMap>(empty);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

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
  }, [reloadToken]);

  function reload() {
    setReloadToken((token) => token + 1);
  }

  return { data, loading, error, reload };
}
