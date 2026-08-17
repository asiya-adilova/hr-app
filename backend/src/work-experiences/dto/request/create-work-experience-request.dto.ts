import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { IsDateOnOrBeforeToday } from '../../../common/validators/date.validators';

export class CreateWorkExperienceDto {
  @ApiProperty({
    example: 'ABC Technologies',
    description: 'Название организации',
    maxLength: 100,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100, {
    message: 'Название организации не должно превышать 100 символов',
  })
  companyName!: string;

  @ApiProperty({
    example: 2,
    description: 'Идентификатор должности из справочника Position',
  })
  @Type(() => Number)
  @IsInt()
  positionId!: number;

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
    example: '2019-06-01',
    description: 'Дата начала работы. Не может быть раньше даты рождения сотрудника.',
    type: String,
    format: 'date',
  })
  @IsDateString()
  @IsDateOnOrBeforeToday({
    message: 'Дата начала не может быть в будущем',
  })
  startDate!: string;

  @ApiPropertyOptional({
    example: '2022-03-15',
    description:
      'Дата окончания работы. Не нужна, если это текущее место работы. Не может быть раньше даты рождения сотрудника.',
    type: String,
    format: 'date',
  })
  @ValidateIf((dto: CreateWorkExperienceDto) => !dto.isCurrent)
  @IsNotEmpty({ message: 'Укажите дату окончания или отметьте текущее место работы' })
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    example: false,
    description: 'Текущее место работы',
  })
  @IsOptional()
  @IsBoolean()
  isCurrent?: boolean;

  @ApiProperty({
    example: 'Разработка корпоративных информационных систем',
    description: 'Обязанности',
    maxLength: 500,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(500, {
    message: 'Обязанности не должны превышать 500 символов',
  })
  responsibilities!: string;
}
