import { apiRequest } from '../../../services/api-client.ts';
import type { ReferenceItem, ReferenceMap } from '../types/references.ts';

async function getList(path: string) {
  return apiRequest<ReferenceItem[]>(path);
}

export const referencesApi = {
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
    };
  },
};
