import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class EmployeeTableResponseDto {
  @ApiProperty({
    example: 1,
  })
  id!: number;

  @ApiProperty({
    example: 'EMP-000123',
  })
  employeeNumber!: string;

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
    example: 'Алишер Каримов Рустамович',
  })
  fullName!: string;

  @ApiProperty({
    example: 'Информационные технологии',
  })
  departmentName!: string;

  @ApiProperty({
    example: 'Главный специалист',
  })
  positionName!: string;

  @ApiProperty({
    example: 'Высшее',
  })
  educationLevelName!: string;

  @ApiProperty({
    example: '2020-03-15',
  })
  hireDate!: Date;

  @ApiProperty({
    example: 96,
    description: 'Общий трудовой стаж в месяцах',
  })
  totalExperienceMonths!: number;

  @ApiPropertyOptional({
    example: 72,
    description: 'Стаж по специальности в месяцах',
  })
  specialtyExperienceMonths?: number;

  @ApiProperty({
    example: true,
  })
  hasDriverLicense!: boolean;

  @ApiProperty({
    example: true,
  })
  militaryService!: boolean;

  @ApiProperty({
    example: '2026-08-16T18:30:00.000Z',
  })
  createdAt!: Date;

  @ApiProperty({
    example: '2026-08-16T19:15:00.000Z',
  })
  updatedAt!: Date;
}
