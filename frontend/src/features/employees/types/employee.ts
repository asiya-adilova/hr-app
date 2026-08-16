export type EmployeeReference = {
  id: number;
  name: string;
};

export type EducationItem = {
  id?: number;
  institutionName: string;
  specialty: string;
  graduationYear: number;
};

export type WorkExperienceItem = {
  id?: number;
  companyName: string;
  position: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  responsibilities?: string;
};

export type EmployeeDetails = {
  id: number;
  accountId: number;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  birthDate: string;
  pinfl: string;
  passport: {
    series: string;
    number: string;
    issueDate: string;
    issuedBy: string;
  };
  contact: {
    phone: string;
    email?: string;
    address: string;
  };
  hireDate: string;
  gender: EmployeeReference;
  citizenship: EmployeeReference;
  nationality: EmployeeReference;
  department: EmployeeReference;
  position: EmployeeReference;
  employmentType: EmployeeReference;
  educationLevel: EmployeeReference;
  maritalStatus: EmployeeReference;
  experience: {
    totalMonths: number;
    specialtyMonths?: number;
  };
  education: EducationItem[];
  workExperience: WorkExperienceItem[];
  driverLicense: {
    hasLicense: boolean;
    categoryId?: number;
    categoryName?: string;
  };
  militaryService: boolean;
  additionalInfo?: string;
};

export type CreateEmployeePayload = {
  accountId: number;
  birthDate: string;
  pinfl: string;
  passportSeries: string;
  passportNumber: string;
  passportIssueDate: string;
  passportIssuedBy: string;
  phone: string;
  email?: string;
  address: string;
  employeeNumber: string;
  hireDate: string;
  genderId: number;
  citizenshipId: number;
  nationalityId: number;
  departmentId: number;
  positionId: number;
  employmentTypeId: number;
  educationLevelId: number;
  maritalStatusId: number;
  driverLicenseCategoryId?: number;
  totalExperienceMonths: number;
  specialtyExperienceMonths?: number;
  militaryService: boolean;
  hasDriverLicense: boolean;
  additionalInfo?: string;
};

export type EmployeeTableItem = {
  id: number;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  fullName: string;
  departmentName: string;
  positionName: string;
};
