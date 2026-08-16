import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateWorkExperienceDto {
  @ApiProperty({
    example: 'ABC Technologies',
    description: 'Название организации',
    maxLength: 255,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  companyName!: string;

  @ApiProperty({
    example: 'Software Engineer',
    description: 'Должность',
    maxLength: 255,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  position!: string;

  @ApiProperty({
    example: '2019-06-01',
    description: 'Дата начала работы',
    type: String,
    format: 'date',
  })
  @IsDateString()
  startDate!: string;

  @ApiPropertyOptional({
    example: '2022-03-15',
    description: 'Дата окончания работы',
    type: String,
    format: 'date',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    example: false,
    description: 'Текущее место работы',
  })
  @IsOptional()
  @IsBoolean()
  isCurrent?: boolean;

  @ApiPropertyOptional({
    example: 'Разработка корпоративных информационных систем',
    description: 'Обязанности',
    maxLength: 2000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  responsibilities?: string;
}
