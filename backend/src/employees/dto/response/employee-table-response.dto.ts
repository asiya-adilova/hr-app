import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class EmployeeTableResponseDto {
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
    example: 'Алишер Каримов Рустамович',
  })
  fullName!: string;

  @ApiProperty({
    example: '31234567890123',
    description: 'ПИНФЛ',
  })
  pinfl!: string;

  @ApiPropertyOptional({
    example: 'Информационные технологии',
  })
  departmentName?: string;

  @ApiPropertyOptional({
    example: 'Главный специалист',
  })
  positionName?: string;

  @ApiPropertyOptional({
    example: 'Ташкент',
  })
  cityName?: string;

  @ApiPropertyOptional({
    example: 'Узбекистан',
  })
  countryName?: string;

  @ApiPropertyOptional({
    example: '2020-03-15',
  })
  hireDate?: Date;

  @ApiProperty({
    example: '+998901234567',
  })
  phone!: string;

  @ApiPropertyOptional({
    example: 72,
    description: 'Стаж по специальности в месяцах',
  })
  specialtyExperienceMonths?: number;

  @ApiProperty({
    example: '2026-08-16T18:30:00.000Z',
  })
  createdAt!: Date;

  @ApiProperty({
    example: '2026-08-16T19:15:00.000Z',
  })
  updatedAt!: Date;
}
