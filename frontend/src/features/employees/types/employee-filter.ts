export type EmployeeFilter = {
  searchTerm?: string;
  departmentIds?: number[];
  positionIds?: number[];
  citizenshipIds?: number[];
  nationalityIds?: number[];
  educationLevelIds?: number[];
  maritalStatusIds?: number[];
  employmentTypeIds?: number[];
  hasDriverLicense?: boolean;
  militaryService?: boolean;
};

export function compactEmployeeFilter(filter: EmployeeFilter): EmployeeFilter {
  const next: EmployeeFilter = {};

  if (filter.searchTerm?.trim()) {
    next.searchTerm = filter.searchTerm.trim();
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

  if (filter.hasDriverLicense !== undefined) {
    next.hasDriverLicense = filter.hasDriverLicense;
  }

  if (filter.militaryService !== undefined) {
    next.militaryService = filter.militaryService;
  }

  return next;
}
