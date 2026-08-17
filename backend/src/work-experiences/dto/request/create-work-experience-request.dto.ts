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
    maxLength: 255,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  companyName!: string;

  @ApiProperty({
    example: 2,
    description: 'Идентификатор должности из справочника Position',
  })
  @Type(() => Number)
  @IsInt()
  positionId!: number;

  @ApiProperty({
    example: '2019-06-01',
    description: 'Дата начала работы',
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
    description: 'Дата окончания работы. Не нужна, если это текущее место работы.',
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
    maxLength: 2000,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(2000)
  responsibilities!: string;
}
