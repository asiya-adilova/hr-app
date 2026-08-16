export type ReferenceItem = {
  id: number;
  name: string;
};

export type ReferenceMap = {
  genders: ReferenceItem[];
  citizenships: ReferenceItem[];
  nationalities: ReferenceItem[];
  departments: ReferenceItem[];
  positions: ReferenceItem[];
  employmentTypes: ReferenceItem[];
  educationLevels: ReferenceItem[];
  maritalStatuses: ReferenceItem[];
  driverLicenseCategories: ReferenceItem[];
};
