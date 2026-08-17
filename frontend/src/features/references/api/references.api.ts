import { apiRequest } from '../../../services/api-client.ts';
import type { CityItem, ReferenceItem, ReferenceMap } from '../types/references.ts';

async function getList<T extends ReferenceItem>(path: string, search?: string) {
  const term = search?.trim();
  const query = term ? `?search=${encodeURIComponent(term)}` : '';
  return apiRequest<T[]>(`${path}${query}`);
}

export const referencesApi = {
  search(path: string, search?: string) {
    return getList(path, search);
  },

  searchCities(search?: string) {
    return getList<CityItem>('/cities', search);
  },

  async getAll(): Promise<ReferenceMap> {
    const [
      genders,
      citizenships,
      nationalities,
      departments,
      positions,
      employmentTypes,
      educationLevels,
      maritalStatuses,
      driverLicenseCategories,
      countries,
      cities,
    ] = await Promise.all([
      getList('/genders'),
      getList('/citizenships'),
      getList('/nationalities'),
      getList('/departments'),
      getList('/positions'),
      getList('/employment-types'),
      getList('/education-levels'),
      getList('/marital-statuses'),
      getList('/driver-license-categories'),
      getList('/countries'),
      getList<CityItem>('/cities'),
    ]);

    return {
      genders,
      citizenships,
      nationalities,
      departments,
      positions,
      employmentTypes,
      educationLevels,
      maritalStatuses,
      driverLicenseCategories,
      countries,
      cities,
    };
  },
};
