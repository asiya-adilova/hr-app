import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EducationResponseDto } from '../../../educations/dto/response/education-response.dto';
import { WorkExperienceResponseDto } from '../../../work-experiences/dto/response/work-experience-response.dto';
import { RelativeResponseDto } from '../../../relatives/dto/response/relative-response.dto';

export class EmployeeReferenceResponseDto {
  @ApiProperty({
    example: 1,
  })
  id!: number;

  @ApiProperty({
    example: 'Высшее',
  })
  name!: string;
}

export class EmployeePassportResponseDto {
  @ApiProperty({
    example: 'AA',
  })
  series!: string;

  @ApiProperty({
    example: '1234567',
  })
  number!: string;

  @ApiProperty({
    example: '2029-06-20',
    description: 'Дата окончания срока действия паспорта',
  })
  expireDate!: Date;

  @ApiProperty({
    example: 'ГУВД г. Ташкента',
  })
  issuedBy!: string;
}

export class EmployeeExperienceResponseDto {
  @ApiProperty({
    example: 96,
    description: 'Общий трудовой стаж в месяцах',
  })
  totalMonths!: number;

  @ApiPropertyOptional({
    example: 72,
    description: 'Стаж по специальности в месяцах',
  })
  specialtyMonths?: number;
}

export class EmployeeContactResponseDto {
  @ApiProperty({
    example: '+998901234567',
  })
  phone!: string;

  @ApiPropertyOptional({
    example: 'alisher.karimov@example.com',
  })
  email?: string;

  @ApiProperty({
    example: 'г. Ташкент, Мирзо-Улугбекский район',
  })
  address!: string;

  @ApiPropertyOptional({
    type: EmployeeReferenceResponseDto,
  })
  country?: EmployeeReferenceResponseDto;

  @ApiPropertyOptional({
    type: EmployeeReferenceResponseDto,
  })
  city?: EmployeeReferenceResponseDto;
}

export class EmployeeDriverLicenseResponseDto {
  @ApiProperty({
    example: true,
  })
  hasLicense!: boolean;

  @ApiPropertyOptional({
    example: 1,
  })
  categoryId?: number;

  @ApiPropertyOptional({
    example: 'B',
  })
  categoryName?: string;
}

export class EmployeeDetailsResponseDto {
  // =========================
  // General
  // =========================

  @ApiProperty({
    example: 1,
  })
  id!: number;

  @ApiProperty({
    example: 1,
  })
  accountId!: number;

  @ApiProperty({
    example: 'EMP-000123',
  })
  employeeNumber!: string;

  @ApiProperty({
    example: 1,
    description: 'Последний сохранённый шаг анкеты',
  })
  formStep!: number;

  @ApiProperty({
    example: 'Алишер',
  })
  firstName!: string;

  @ApiProperty({
    example: 'Каримов',
  })
  lastName!: string;

  @ApiPropertyOptional({
    example: 'Рустамович',
  })
  middleName?: string;

  @ApiProperty({
    example: '1988-05-14',
  })
  birthDate!: Date;

  @ApiProperty({
    example: '30105801234567',
  })
  pinfl!: string;

  // =========================
  // Passport
  // =========================

  @ApiProperty({
    type: EmployeePassportResponseDto,
  })
  passport!: EmployeePassportResponseDto;

  // =========================
  // Contact
  // =========================

  @ApiProperty({
    type: EmployeeContactResponseDto,
  })
  contact!: EmployeeContactResponseDto;

  // =========================
  // Employment
  // =========================

  @ApiPropertyOptional({
    example: '2020-03-15',
  })
  hireDate?: Date;

  @ApiProperty({
    type: EmployeeReferenceResponseDto,
  })
  gender!: EmployeeReferenceResponseDto;

  @ApiProperty({
    type: EmployeeReferenceResponseDto,
  })
  citizenship!: EmployeeReferenceResponseDto;

  @ApiProperty({
    type: EmployeeReferenceResponseDto,
  })
  nationality!: EmployeeReferenceResponseDto;

  @ApiPropertyOptional({
    type: EmployeeReferenceResponseDto,
  })
  department?: EmployeeReferenceResponseDto;

  @ApiPropertyOptional({
    type: EmployeeReferenceResponseDto,
  })
  position?: EmployeeReferenceResponseDto;

  @ApiPropertyOptional({
    type: EmployeeReferenceResponseDto,
  })
  employmentType?: EmployeeReferenceResponseDto;

  @ApiProperty({
    type: EmployeeReferenceResponseDto,
  })
  maritalStatus!: EmployeeReferenceResponseDto;

  // =========================
  // Experience
  // =========================

  @ApiProperty({
    type: EmployeeExperienceResponseDto,
  })
  experience!: EmployeeExperienceResponseDto;

  // =========================
  // Related Entities
  // =========================

  @ApiProperty({
    type: [EducationResponseDto],
  })
  education!: EducationResponseDto[];

  @ApiProperty({
    type: [WorkExperienceResponseDto],
  })
  workExperience!: WorkExperienceResponseDto[];

  @ApiProperty({
    type: [RelativeResponseDto],
  })
  relatives!: RelativeResponseDto[];

  // =========================
  // Driver license
  // =========================

  @ApiProperty({
    type: EmployeeDriverLicenseResponseDto,
  })
  driverLicense!: EmployeeDriverLicenseResponseDto;

  // =========================
  // Additional information
  // =========================

  @ApiProperty({
    example: true,
  })
  militaryService!: boolean;

  @ApiPropertyOptional({
    example: 'Имеет опыт работы в банковской сфере.',
  })
  additionalInfo?: string;

  // =========================
  // Audit
  // =========================

  @ApiProperty({
    example: '2026-08-16T18:30:00.000Z',
  })
  createdAt!: Date;

  @ApiProperty({
    example: '2026-08-16T19:15:00.000Z',
  })
  updatedAt!: Date;
}
