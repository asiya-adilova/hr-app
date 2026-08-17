import {
  EmployeeContactResponseDto,
  EmployeeDetailsResponseDto,
  EmployeeDriverLicenseResponseDto,
  EmployeeExperienceResponseDto,
  EmployeePassportResponseDto,
  EmployeeReferenceResponseDto,
} from '../dto/response/employee-details-response.dto';
import { EmployeeTableResponseDto } from '../dto/response/employee-table-response.dto';
import { EducationResponseDto } from '../../educations/dto/response/education-response.dto';
import { RelativeResponseDto } from '../../relatives/dto/response/relative-response.dto';
import { WorkExperienceResponseDto } from '../../work-experiences/dto/response/work-experience-response.dto';

type NamedReference = {
  id: number;
  name: string;
};

type AccountRecord = {
  firstName: string;
  lastName: string;
  middleName: string | null;
  email: string;
};

type EmployeeRecord = {
  id: number;
  accountId: number;
  employeeNumber: string;
  birthDate: Date;
  pinfl: string;
  passportSeries: string;
  passportNumber: string;
  passportExpireDate: Date;
  passportIssuedBy: string;
  phone: string;
  address: string;
  countryId: number;
  cityId: number;
  hireDate: Date | null;
  formStep: number;
  totalExperienceMonths: number;
  specialtyExperienceMonths: number | null;
  hasDriverLicense: boolean;
  militaryService: boolean;
  additionalInfo: string | null;
  createdAt: Date;
  updatedAt: Date;
  account: AccountRecord;
};

type EducationRecord = {
  id: number;
  institution: string;
  specialty: string;
  educationLevelId: number;
  graduationYear: number;
  countryId: number;
  cityId: number;
  educationLevel?: NamedReference | null;
  country?: NamedReference | null;
  city?: NamedReference | null;
};

type WorkExperienceRecord = {
  id: number;
  companyName: string;
  positionId: number;
  startDate: Date;
  endDate: Date | null;
  responsibilities: string | null;
  countryId: number;
  cityId: number;
  position?: NamedReference | null;
  country?: NamedReference | null;
  city?: NamedReference | null;
};

type RelativeRecord = {
  id: number;
  relationship: string;
  fullName: string;
  birthDate: Date | null;
  workplace: string | null;
  phone: string | null;
};

export const employeeLookupInclude = {
  account: true,
  gender: true,
  citizenship: true,
  nationality: true,
  department: true,
  position: true,
  employmentType: true,
  maritalStatus: true,
  driverLicenseCategory: true,
  country: true,
  city: true,
} as const;

export const employeeTableInclude = {
  account: true,
  department: true,
  position: true,
  country: true,
  city: true,
} as const;

export type EmployeeWithLookups = EmployeeRecord & {
  gender: NamedReference;
  citizenship: NamedReference;
  nationality: NamedReference;
  department: NamedReference | null;
  position: NamedReference | null;
  employmentType: NamedReference | null;
  maritalStatus: NamedReference;
  driverLicenseCategory: NamedReference | null;
  country: NamedReference;
  city: NamedReference;
};

export type EmployeeWithTableReferences = EmployeeRecord & {
  department: NamedReference | null;
  position: NamedReference | null;
  country: NamedReference;
  city: NamedReference;
};

export class EmployeeMapper {
  private constructor() {}

  static toReferenceResponse(reference: {
    id: number;
    name: string;
  }): EmployeeReferenceResponseDto {
    return {
      id: reference.id,
      name: reference.name,
    };
  }

  static toEducationResponse(education: EducationRecord): EducationResponseDto {
    return {
      id: education.id,
      institutionName: education.institution,
      specialty: education.specialty,
      educationLevelId: education.educationLevelId,
      educationLevelName: education.educationLevel?.name ?? '',
      countryId: education.countryId,
      countryName: education.country?.name ?? '',
      cityId: education.cityId,
      cityName: education.city?.name ?? '',
      graduationYear: education.graduationYear,
    };
  }

  static toWorkExperienceResponse(
    experience: WorkExperienceRecord,
  ): WorkExperienceResponseDto {
    return {
      id: experience.id,
      companyName: experience.companyName,
      positionId: experience.positionId,
      positionName: experience.position?.name ?? '',
      countryId: experience.countryId,
      countryName: experience.country?.name ?? '',
      cityId: experience.cityId,
      cityName: experience.city?.name ?? '',
      startDate: experience.startDate,
      endDate: experience.endDate ?? undefined,
      isCurrent: experience.endDate == null,
      responsibilities: experience.responsibilities ?? undefined,
    };
  }

  static toRelativeResponse(relative: RelativeRecord): RelativeResponseDto {
    return {
      id: relative.id,
      relationshipType: relative.relationship,
      fullName: relative.fullName,
      birthDate: relative.birthDate ?? undefined,
      occupation: relative.workplace ?? undefined,
      phone: relative.phone ?? undefined,
    };
  }

  static toTableResponse(
    employee: EmployeeWithTableReferences,
  ): EmployeeTableResponseDto {
    return {
      id: employee.id,
      accountId: employee.accountId,
      employeeNumber: employee.employeeNumber,
      fullName: EmployeeMapper.toFullName(employee.account),
      pinfl: employee.pinfl,
      departmentName: employee.department?.name ?? '—',
      positionName: employee.position?.name ?? '—',
      cityName: employee.city?.name ?? undefined,
      countryName: employee.country?.name ?? undefined,
      hireDate: employee.hireDate ?? undefined,
      phone: employee.phone,
      specialtyExperienceMonths:
        employee.specialtyExperienceMonths ?? undefined,
      createdAt: employee.createdAt,
      updatedAt: employee.updatedAt,
    };
  }

  static toDetailsResponse(
    employee: EmployeeWithLookups,
    related: {
      education: EducationResponseDto[];
      workExperience: WorkExperienceResponseDto[];
      relatives: RelativeResponseDto[];
    },
  ): EmployeeDetailsResponseDto {
    return {
      id: employee.id,
      accountId: employee.accountId,
      employeeNumber: employee.employeeNumber,
      formStep: employee.formStep,

      firstName: employee.account.firstName,
      lastName: employee.account.lastName,
      middleName: employee.account.middleName ?? undefined,

      birthDate: employee.birthDate,
      pinfl: employee.pinfl,

      passport: EmployeeMapper.toPassportResponse(employee),
      contact: EmployeeMapper.toContactResponse(employee),

      hireDate: employee.hireDate ?? undefined,

      gender: EmployeeMapper.toReferenceResponse(employee.gender),
      citizenship: EmployeeMapper.toReferenceResponse(employee.citizenship),
      nationality: EmployeeMapper.toReferenceResponse(employee.nationality),
      department: employee.department
        ? EmployeeMapper.toReferenceResponse(employee.department)
        : undefined,
      position: employee.position
        ? EmployeeMapper.toReferenceResponse(employee.position)
        : undefined,
      employmentType: employee.employmentType
        ? EmployeeMapper.toReferenceResponse(employee.employmentType)
        : undefined,
      maritalStatus: EmployeeMapper.toReferenceResponse(employee.maritalStatus),

      experience: EmployeeMapper.toExperienceResponse(employee),
      driverLicense: EmployeeMapper.toDriverLicenseResponse(employee),

      education: related.education,
      workExperience: related.workExperience,
      relatives: related.relatives,

      militaryService: employee.militaryService,
      additionalInfo: employee.additionalInfo ?? undefined,

      createdAt: employee.createdAt,
      updatedAt: employee.updatedAt,
    };
  }

  static toEducationCreateData(dto: {
    institutionName: string;
    specialty?: string;
    educationLevelId: number;
    countryId: number;
    cityId: number;
    graduationYear?: number;
  }) {
    return {
      institution: dto.institutionName,
      specialty: dto.specialty ?? '',
      educationLevelId: dto.educationLevelId,
      countryId: dto.countryId,
      cityId: dto.cityId,
      graduationYear: dto.graduationYear ?? 0,
    };
  }

  static toWorkExperienceCreateData(dto: {
    companyName: string;
    positionId: number;
    countryId: number;
    cityId: number;
    startDate: string | Date;
    endDate?: string | Date | null;
    isCurrent?: boolean;
    responsibilities?: string;
  }) {
    return {
      companyName: dto.companyName,
      positionId: dto.positionId,
      countryId: dto.countryId,
      cityId: dto.cityId,
      startDate: new Date(dto.startDate),
      endDate: dto.isCurrent
        ? null
        : dto.endDate
          ? new Date(dto.endDate)
          : null,
      responsibilities: dto.responsibilities,
    };
  }

  static toRelativeCreateData(dto: {
    fullName: string;
    relationshipType: string;
    birthDate?: string | Date | null;
    phone?: string;
    occupation?: string;
  }) {
    return {
      fullName: dto.fullName,
      relationship: dto.relationshipType,
      birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
      phone: dto.phone,
      workplace: dto.occupation,
    };
  }

  static toEmployeeUncheckedCreateData(dto: EmployeeDetailsResponseDto) {
    return {
      accountId: dto.accountId,
      birthDate: dto.birthDate,
      pinfl: dto.pinfl,
      passportSeries: dto.passport.series,
      passportNumber: dto.passport.number,
      passportExpireDate: dto.passport.expireDate,
      passportIssuedBy: dto.passport.issuedBy,
      phone: dto.contact.phone,
      address: dto.contact.address,
      countryId: dto.contact.country?.id,
      cityId: dto.contact.city?.id,
      employeeNumber: dto.employeeNumber,
      hireDate: dto.hireDate,
      formStep: dto.formStep ?? 0,
      totalExperienceMonths: dto.experience.totalMonths,
      specialtyExperienceMonths: dto.experience.specialtyMonths,
      militaryService: dto.militaryService,
      hasDriverLicense: dto.driverLicense.hasLicense,
      additionalInfo: dto.additionalInfo,
      genderId: dto.gender.id,
      citizenshipId: dto.citizenship.id,
      nationalityId: dto.nationality.id,
      departmentId: dto.department?.id,
      positionId: dto.position?.id,
      employmentTypeId: dto.employmentType?.id,
      maritalStatusId: dto.maritalStatus.id,
      driverLicenseCategoryId: dto.driverLicense.categoryId,
      educations: {
        create: dto.education.map((education) =>
          EmployeeMapper.toEducationCreateData(education),
        ),
      },
      workExperiences: {
        create: dto.workExperience.map((experience) =>
          EmployeeMapper.toWorkExperienceCreateData(experience),
        ),
      },
      relatives: {
        create: dto.relatives.map((relative) =>
          EmployeeMapper.toRelativeCreateData(relative),
        ),
      },
    };
  }

  private static toPassportResponse(
    employee: EmployeeWithLookups,
  ): EmployeePassportResponseDto {
    return {
      series: employee.passportSeries,
      number: employee.passportNumber,
      expireDate: employee.passportExpireDate,
      issuedBy: employee.passportIssuedBy,
    };
  }

  private static toContactResponse(
    employee: EmployeeWithLookups,
  ): EmployeeContactResponseDto {
    return {
      phone: employee.phone,
      email: employee.account.email,
      address: employee.address,
      country: EmployeeMapper.toReferenceResponse(employee.country),
      city: EmployeeMapper.toReferenceResponse(employee.city),
    };
  }

  private static toExperienceResponse(
    employee: EmployeeWithLookups,
  ): EmployeeExperienceResponseDto {
    return {
      totalMonths: employee.totalExperienceMonths,
      specialtyMonths: employee.specialtyExperienceMonths ?? undefined,
    };
  }

  private static toDriverLicenseResponse(
    employee: EmployeeWithLookups,
  ): EmployeeDriverLicenseResponseDto {
    return {
      hasLicense: employee.hasDriverLicense,
      categoryId: employee.driverLicenseCategory?.id,
      categoryName: employee.driverLicenseCategory?.name,
    };
  }

  private static toFullName(employee: {
    firstName: string;
    lastName: string;
    middleName?: string | null;
  }): string {
    return [employee.firstName, employee.lastName, employee.middleName]
      .filter((part): part is string => Boolean(part))
      .join(' ');
  }
}
