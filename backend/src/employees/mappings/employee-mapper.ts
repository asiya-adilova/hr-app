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
  passportIssueDate: Date;
  passportIssuedBy: string;
  phone: string;
  email: string | null;
  address: string;
  hireDate: Date;
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
  graduationYear: number;
};

type WorkExperienceRecord = {
  id: number;
  companyName: string;
  position: string;
  startDate: Date;
  endDate: Date | null;
  responsibilities: string | null;
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
  educationLevel: true,
  maritalStatus: true,
  driverLicenseCategory: true,
} as const;

export const employeeTableInclude = {
  account: true,
  department: true,
  position: true,
  educationLevel: true,
} as const;

export type EmployeeWithLookups = EmployeeRecord & {
  gender: NamedReference;
  citizenship: NamedReference;
  nationality: NamedReference;
  department: NamedReference;
  position: NamedReference;
  employmentType: NamedReference;
  educationLevel: NamedReference;
  maritalStatus: NamedReference;
  driverLicenseCategory: NamedReference | null;
};

export type EmployeeWithTableReferences = EmployeeRecord & {
  department: NamedReference;
  position: NamedReference;
  educationLevel: NamedReference;
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
      graduationYear: education.graduationYear,
    };
  }

  static toWorkExperienceResponse(
    experience: WorkExperienceRecord,
  ): WorkExperienceResponseDto {
    return {
      id: experience.id,
      companyName: experience.companyName,
      position: experience.position,
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
      firstName: employee.account.firstName,
      lastName: employee.account.lastName,
      middleName: employee.account.middleName ?? undefined,
      fullName: EmployeeMapper.toFullName(employee.account),
      departmentName: employee.department.name,
      positionName: employee.position.name,
      educationLevelName: employee.educationLevel.name,
      hireDate: employee.hireDate,
      totalExperienceMonths: employee.totalExperienceMonths,
      specialtyExperienceMonths:
        employee.specialtyExperienceMonths ?? undefined,
      hasDriverLicense: employee.hasDriverLicense,
      militaryService: employee.militaryService,
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

      firstName: employee.account.firstName,
      lastName: employee.account.lastName,
      middleName: employee.account.middleName ?? undefined,

      birthDate: employee.birthDate,
      pinfl: employee.pinfl,

      passport: EmployeeMapper.toPassportResponse(employee),
      contact: EmployeeMapper.toContactResponse(employee),

      hireDate: employee.hireDate,

      gender: EmployeeMapper.toReferenceResponse(employee.gender),
      citizenship: EmployeeMapper.toReferenceResponse(employee.citizenship),
      nationality: EmployeeMapper.toReferenceResponse(employee.nationality),
      department: EmployeeMapper.toReferenceResponse(employee.department),
      position: EmployeeMapper.toReferenceResponse(employee.position),
      employmentType: EmployeeMapper.toReferenceResponse(
        employee.employmentType,
      ),
      educationLevel: EmployeeMapper.toReferenceResponse(
        employee.educationLevel,
      ),
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
    graduationYear?: number;
  }) {
    return {
      institution: dto.institutionName,
      specialty: dto.specialty ?? '',
      graduationYear: dto.graduationYear ?? 0,
    };
  }

  static toWorkExperienceCreateData(dto: {
    companyName: string;
    position: string;
    startDate: string | Date;
    endDate?: string | Date | null;
    isCurrent?: boolean;
    responsibilities?: string;
  }) {
    return {
      companyName: dto.companyName,
      position: dto.position,
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
      passportIssueDate: dto.passport.issueDate,
      passportIssuedBy: dto.passport.issuedBy,
      phone: dto.contact.phone,
      email: dto.contact.email,
      address: dto.contact.address,
      employeeNumber: dto.employeeNumber,
      hireDate: dto.hireDate,
      totalExperienceMonths: dto.experience.totalMonths,
      specialtyExperienceMonths: dto.experience.specialtyMonths,
      militaryService: dto.militaryService,
      hasDriverLicense: dto.driverLicense.hasLicense,
      additionalInfo: dto.additionalInfo,
      genderId: dto.gender.id,
      citizenshipId: dto.citizenship.id,
      nationalityId: dto.nationality.id,
      departmentId: dto.department.id,
      positionId: dto.position.id,
      employmentTypeId: dto.employmentType.id,
      educationLevelId: dto.educationLevel.id,
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
      issueDate: employee.passportIssueDate,
      issuedBy: employee.passportIssuedBy,
    };
  }

  private static toContactResponse(
    employee: EmployeeWithLookups,
  ): EmployeeContactResponseDto {
    return {
      phone: employee.phone,
      email: employee.email ?? employee.account.email,
      address: employee.address,
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
