import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import {
  IsDateOnOrAfterField,
  IsDateOnOrAfterToday,
  IsDateOnOrBefore,
} from '../../../common/validators/date.validators';

export class CreateEmployeeDto {
  @ApiProperty({
    example: 1,
    description: 'Идентификатор аккаунта сотрудника',
  })
  @IsInt()
  accountId!: number;

  @ApiProperty({
    example: '1998-05-10',
    description:
      'Дата рождения сотрудника. Не позднее 2010-12-31 (не моложе 16 лет).',
    type: String,
    format: 'date',
  })
  @IsDateString()
  @IsDateOnOrBefore('2010-12-31', {
    message: 'Сотрудник должен быть не моложе 16 лет (год рождения не позже 2010)',
  })
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
    description: 'Серия паспорта. Ровно 2 буквы.',
    minLength: 2,
    maxLength: 2,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(2)
  @Matches(/^[A-Za-zА-Яа-яЁё]{2}$/, {
    message: 'Серия паспорта должна состоять из 2 букв',
  })
  passportSeries!: string;

  @ApiProperty({
    example: '1234567',
    description: 'Номер паспорта. Только цифры, не больше 7.',
    minLength: 1,
    maxLength: 7,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(7)
  @Matches(/^\d{1,7}$/, {
    message: 'Номер паспорта должен содержать только цифры, не больше 7',
  })
  passportNumber!: string;

  @ApiProperty({
    example: '2030-06-15',
    description:
      'Дата окончания срока действия паспорта. Не может быть раньше даты рождения.',
    type: String,
    format: 'date',
  })
  @IsDateString()
  @IsDateOnOrAfterToday({
    message: 'Укажите действительный паспорт',
  })
  @IsDateOnOrAfterField('birthDate', {
    message: 'Срок действия паспорта не может быть раньше даты рождения',
  })
  passportExpireDate!: string;

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
    description: 'Номер телефона сотрудника в международном формате',
    maxLength: 30,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(30)
  @Matches(/^\+[1-9]\d{7,14}$/, {
    message: 'Укажите корректный номер телефона в международном формате',
  })
  phone!: string;

  @ApiProperty({
    example: 'г. Ташкент, ул. Навои, дом 10',
    description: 'Адрес проживания сотрудника',
    maxLength: 100,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100, {
    message: 'Адрес не должен превышать 100 символов',
  })
  address!: string;

  @ApiProperty({
    example: 1,
    description: 'Идентификатор страны из справочника Country',
  })
  @Type(() => Number)
  @IsInt()
  countryId!: number;

  @ApiProperty({
    example: 1,
    description: 'Идентификатор города из справочника City',
  })
  @Type(() => Number)
  @IsInt()
  cityId!: number;

  @ApiProperty({
    example: 'EMP-001',
    description: 'Уникальный табельный номер сотрудника',
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  employeeNumber?: string;

  @ApiPropertyOptional({
    example: '2026-01-15',
    description: 'Дата приема на работу. Не может быть раньше даты рождения.',
    type: String,
    format: 'date',
  })
  @IsOptional()
  @IsDateString()
  @IsDateOnOrAfterField('birthDate', {
    message: 'Дата приёма не может быть раньше даты рождения',
  })
  hireDate?: string;

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

  @ApiPropertyOptional({
    example: 1,
    description: 'Идентификатор подразделения из справочника Department',
  })
  @IsOptional()
  @IsInt()
  departmentId?: number;

  @ApiPropertyOptional({
    example: 2,
    description: 'Идентификатор должности из справочника Position',
  })
  @IsOptional()
  @IsInt()
  positionId?: number;

  @ApiPropertyOptional({
    example: 1,
    description: 'Идентификатор типа занятости из справочника EmploymentType',
  })
  @IsOptional()
  @IsInt()
  employmentTypeId?: number;

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

  @ApiPropertyOptional({
    example: true,
    description: 'Проходил ли сотрудник военную службу',
  })
  @IsOptional()
  @IsBoolean()
  militaryService?: boolean;

  @ApiPropertyOptional({
    example: false,
    description: 'Наличие водительского удостоверения',
  })
  @IsOptional()
  @IsBoolean()
  hasDriverLicense?: boolean;

  @ApiPropertyOptional({
    example: 1,
    description: 'Последний сохранённый шаг анкеты',
    minimum: 0,
    maximum: 5,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(5)
  formStep?: number;

  @ApiPropertyOptional({
    example: 'Дополнительная информация о сотруднике',
    description: 'Дополнительная информация',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500, {
    message: 'Дополнительная информация не должна превышать 500 символов',
  })
  additionalInfo?: string;
}
