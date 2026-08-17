export type EmployeeFilter = {
  searchTerm?: string;
  countryIds?: number[];
  cityIds?: number[];
  departmentIds?: number[];
  positionIds?: number[];
  citizenshipIds?: number[];
  nationalityIds?: number[];
  educationLevelIds?: number[];
  maritalStatusIds?: number[];
  employmentTypeIds?: number[];
  minSpecialtyExperienceYears?: number;
  maxSpecialtyExperienceYears?: number;
  hireDateFrom?: string;
  hireDateTo?: string;
  hasDriverLicense?: boolean;
  militaryService?: boolean;
  sortBy?: EmployeeFilterSort;
};

export const EmployeeFilterSort = {
  Newest: 1,
  Oldest: 2,
  MostExperienced: 3,
  LeastExperienced: 4,
  LastUpdated: 5,
  HireDate: 6,
  NameAsc: 7,
  NameDesc: 8,
} as const;

export type EmployeeFilterSort =
  (typeof EmployeeFilterSort)[keyof typeof EmployeeFilterSort];

export const EMPLOYEE_SORT_OPTIONS: Array<{
  value: EmployeeFilterSort;
  label: string;
}> = [
  { value: EmployeeFilterSort.Newest, label: 'Сначала новые' },
  { value: EmployeeFilterSort.Oldest, label: 'Сначала старые' },
  { value: EmployeeFilterSort.MostExperienced, label: 'Более опытные' },
  { value: EmployeeFilterSort.LeastExperienced, label: 'Менее опытные' },
  { value: EmployeeFilterSort.LastUpdated, label: 'Недавно обновлённые' },
  { value: EmployeeFilterSort.HireDate, label: 'По дате приёма' },
  { value: EmployeeFilterSort.NameAsc, label: 'По ФИО А–Я' },
  { value: EmployeeFilterSort.NameDesc, label: 'По ФИО Я–А' },
];

export type EmployeeFilterPayload = Omit<
  EmployeeFilter,
  'minSpecialtyExperienceYears' | 'maxSpecialtyExperienceYears'
> & {
  minSpecialtyExperienceMonths?: number;
  maxSpecialtyExperienceMonths?: number;
};

export function compactEmployeeFilter(filter: EmployeeFilter): EmployeeFilterPayload {
  const next: EmployeeFilterPayload = {};

  if (filter.searchTerm?.trim()) {
    next.searchTerm = filter.searchTerm.trim();
  }

  if (filter.countryIds?.length) {
    next.countryIds = filter.countryIds;
  }

  if (filter.cityIds?.length) {
    next.cityIds = filter.cityIds;
  }

  if (filter.departmentIds?.length) {
    next.departmentIds = filter.departmentIds;
  }

  if (filter.positionIds?.length) {
    next.positionIds = filter.positionIds;
  }

  if (filter.citizenshipIds?.length) {
    next.citizenshipIds = filter.citizenshipIds;
  }

  if (filter.nationalityIds?.length) {
    next.nationalityIds = filter.nationalityIds;
  }

  if (filter.educationLevelIds?.length) {
    next.educationLevelIds = filter.educationLevelIds;
  }

  if (filter.maritalStatusIds?.length) {
    next.maritalStatusIds = filter.maritalStatusIds;
  }

  if (filter.employmentTypeIds?.length) {
    next.employmentTypeIds = filter.employmentTypeIds;
  }

  if (filter.minSpecialtyExperienceYears !== undefined) {
    next.minSpecialtyExperienceMonths = filter.minSpecialtyExperienceYears * 12;
  }

  if (filter.maxSpecialtyExperienceYears !== undefined) {
    next.maxSpecialtyExperienceMonths = filter.maxSpecialtyExperienceYears * 12;
  }

  if (filter.hireDateFrom) {
    next.hireDateFrom = filter.hireDateFrom;
  }

  if (filter.hireDateTo) {
    next.hireDateTo = filter.hireDateTo;
  }

  if (filter.hasDriverLicense !== undefined) {
    next.hasDriverLicense = filter.hasDriverLicense;
  }

  if (filter.militaryService !== undefined) {
    next.militaryService = filter.militaryService;
  }

  if (filter.sortBy !== undefined) {
    next.sortBy = filter.sortBy;
  }

  return next;
}

export const DEFAULT_EMPLOYEE_FILTER: EmployeeFilter = {
  sortBy: EmployeeFilterSort.Newest,
};

export function isDefaultEmployeeFilter(filter: EmployeeFilter): boolean {
  const compact = compactEmployeeFilter(filter);
  const keys = Object.keys(compact);
  return (
    keys.length === 0 ||
    (keys.length === 1 && compact.sortBy === EmployeeFilterSort.Newest)
  );
}
