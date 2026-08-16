import { ApiPropertyOptional } from '@nestjs/swagger';

import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

import { EmployeeFilterSort } from '../enums/employee-filter-sort.enum';

export class EmployeeFilterDto {
  // General search
  @ApiPropertyOptional({
    example: 'Алишер',
    description:
      'Поиск по имени, фамилии, отчеству, email, табельному номеру или ПИНФЛ',
  })
  @IsOptional()
  @IsString()
  searchTerm?: string;

  // Employee identifiers
  @ApiPropertyOptional({
    example: [1, 2, 3],
    description: 'Список идентификаторов сотрудников',
    type: [Number],
  })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  employeeIds?: number[];

  // Reference filters
  @ApiPropertyOptional({
    example: [1, 2],
    description: 'Фильтр по подразделениям',
    type: [Number],
  })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  departmentIds?: number[];

  @ApiPropertyOptional({
    example: [1, 2],
    description: 'Фильтр по должностям',
    type: [Number],
  })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  positionIds?: number[];

  @ApiPropertyOptional({
    example: [1, 2],
    description: 'Фильтр по гражданству',
    type: [Number],
  })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  citizenshipIds?: number[];

  @ApiPropertyOptional({
    example: [1, 2],
    description: 'Фильтр по национальности',
    type: [Number],
  })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  nationalityIds?: number[];

  @ApiPropertyOptional({
    example: [1, 2],
    description: 'Фильтр по уровню образования',
    type: [Number],
  })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  educationLevelIds?: number[];

  @ApiPropertyOptional({
    example: [1, 2],
    description: 'Фильтр по семейному положению',
    type: [Number],
  })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  maritalStatusIds?: number[];

  @ApiPropertyOptional({
    example: [1, 2],
    description: 'Фильтр по типу занятости',
    type: [Number],
  })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  employmentTypeIds?: number[];

  // Experience
  @ApiPropertyOptional({
    example: 60,
    description: 'Минимальный общий трудовой стаж в месяцах',
    minimum: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  minExperienceMonths?: number;

  @ApiPropertyOptional({
    example: 180,
    description: 'Максимальный общий трудовой стаж в месяцах',
    minimum: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  maxExperienceMonths?: number;

  @ApiPropertyOptional({
    example: 36,
    description: 'Минимальный стаж по специальности в месяцах',
    minimum: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  minSpecialtyExperienceMonths?: number;

  @ApiPropertyOptional({
    example: 120,
    description: 'Максимальный стаж по специальности в месяцах',
    minimum: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  maxSpecialtyExperienceMonths?: number;

  // Dates
  @ApiPropertyOptional({
    example: '1985-01-01',
    description: 'Дата рождения от',
    type: String,
    format: 'date',
  })
  @IsOptional()
  @IsDateString()
  birthDateFrom?: string;

  @ApiPropertyOptional({
    example: '2000-12-31',
    description: 'Дата рождения до',
    type: String,
    format: 'date',
  })
  @IsOptional()
  @IsDateString()
  birthDateTo?: string;

  @ApiPropertyOptional({
    example: '2020-01-01',
    description: 'Дата приема на работу от',
    type: String,
    format: 'date',
  })
  @IsOptional()
  @IsDateString()
  hireDateFrom?: string;

  @ApiPropertyOptional({
    example: '2026-12-31',
    description: 'Дата приема на работу до',
    type: String,
    format: 'date',
  })
  @IsOptional()
  @IsDateString()
  hireDateTo?: string;

  // Additional filters
  @ApiPropertyOptional({
    example: true,
    description: 'Наличие водительского удостоверения',
  })
  @IsOptional()
  @IsBoolean()
  hasDriverLicense?: boolean;

  @ApiPropertyOptional({
    example: true,
    description: 'Проходил ли сотрудник военную службу',
  })
  @IsOptional()
  @IsBoolean()
  militaryService?: boolean;

  // Sorting
  @ApiPropertyOptional({
    enum: EmployeeFilterSort,
    enumName: 'EmployeeFilterSort',
    example: EmployeeFilterSort.MostExperienced,
    description: 'Порядок сортировки результатов',
  })
  @IsOptional()
  @IsEnum(EmployeeFilterSort)
  sortBy?: EmployeeFilterSort;
}
