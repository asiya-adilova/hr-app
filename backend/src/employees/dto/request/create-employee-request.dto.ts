import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateEmployeeDto {
  @ApiProperty({
    example: 1,
    description: 'Идентификатор аккаунта сотрудника',
  })
  @IsInt()
  accountId!: number;

  @ApiProperty({
    example: '1998-05-10',
    description: 'Дата рождения сотрудника',
    type: String,
    format: 'date',
  })
  @IsDateString()
  birthDate!: string;

  @ApiProperty({
    example: '12345678901234',
    description: 'ПИНФЛ сотрудника. Должен содержать ровно 14 цифр.',
    minLength: 14,
    maxLength: 14,
    pattern: '^\\d{14}$',
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{14}$/, {
    message: 'ПИНФЛ должен содержать ровно 14 цифр',
  })
  pinfl!: string;

  @ApiProperty({
    example: 'AA',
    description: 'Серия паспорта',
    maxLength: 10,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(10)
  passportSeries!: string;

  @ApiProperty({
    example: '1234567',
    description: 'Номер паспорта',
    maxLength: 20,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  passportNumber!: string;

  @ApiProperty({
    example: '2020-06-15',
    description: 'Дата выдачи паспорта',
    type: String,
    format: 'date',
  })
  @IsDateString()
  passportIssueDate!: string;

  @ApiProperty({
    example: 'ОВД Мирзо-Улугбекского района',
    description: 'Орган, выдавший паспорт',
    maxLength: 255,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  passportIssuedBy!: string;

  @ApiProperty({
    example: '+998901234567',
    description: 'Номер телефона сотрудника',
    maxLength: 30,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(30)
  phone!: string;

  @ApiPropertyOptional({
    example: 'alisher.karimov@example.com',
    description: 'Электронная почта сотрудника',
    maxLength: 255,
  })
  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string;

  @ApiProperty({
    example: 'г. Ташкент, Мирзо-Улугбекский район, ул. Навои, дом 10',
    description: 'Адрес проживания сотрудника',
    maxLength: 500,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(500)
  address!: string;

  @ApiProperty({
    example: 'EMP-001',
    description: 'Уникальный табельный номер сотрудника',
    maxLength: 50,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  employeeNumber!: string;

  @ApiProperty({
    example: '2026-01-15',
    description: 'Дата приема на работу',
    type: String,
    format: 'date',
  })
  @IsDateString()
  hireDate!: string;

  @ApiProperty({
    example: 1,
    description: 'Идентификатор пола из справочника Gender',
  })
  @IsInt()
  genderId!: number;

  @ApiProperty({
    example: 1,
    description: 'Идентификатор гражданства из справочника Citizenship',
  })
  @IsInt()
  citizenshipId!: number;

  @ApiProperty({
    example: 1,
    description: 'Идентификатор национальности из справочника Nationality',
  })
  @IsInt()
  nationalityId!: number;

  @ApiProperty({
    example: 1,
    description: 'Идентификатор подразделения из справочника Department',
  })
  @IsInt()
  departmentId!: number;

  @ApiProperty({
    example: 2,
    description: 'Идентификатор должности из справочника Position',
  })
  @IsInt()
  positionId!: number;

  @ApiProperty({
    example: 1,
    description: 'Идентификатор типа занятости из справочника EmploymentType',
  })
  @IsInt()
  employmentTypeId!: number;

  @ApiProperty({
    example: 3,
    description:
      'Идентификатор уровня образования из справочника EducationLevel',
  })
  @IsInt()
  educationLevelId!: number;

  @ApiProperty({
    example: 1,
    description:
      'Идентификатор семейного положения из справочника MaritalStatus',
  })
  @IsInt()
  maritalStatusId!: number;

  @ApiPropertyOptional({
    example: 3,
    description:
      'Идентификатор категории водительского удостоверения из справочника DriverLicenseCategory',
  })
  @IsOptional()
  @IsInt()
  driverLicenseCategoryId?: number;

  @ApiProperty({
    example: 60,
    description: 'Общий трудовой стаж в месяцах',
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  totalExperienceMonths!: number;

  @ApiPropertyOptional({
    example: 48,
    description: 'Стаж работы по специальности в месяцах',
    minimum: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  specialtyExperienceMonths?: number;

  @ApiProperty({
    example: true,
    description: 'Проходил ли сотрудник военную службу',
  })
  @IsBoolean()
  militaryService!: boolean;

  @ApiProperty({
    example: false,
    description: 'Наличие водительского удостоверения',
  })
  @IsBoolean()
  hasDriverLicense!: boolean;

  @ApiPropertyOptional({
    example: 'Дополнительная информация о сотруднике',
    description: 'Дополнительная информация',
    maxLength: 2000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  additionalInfo?: string;
}
