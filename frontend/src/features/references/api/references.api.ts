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

  getAll() {
    return apiRequest<ReferenceMap>('/references');
  },
};
