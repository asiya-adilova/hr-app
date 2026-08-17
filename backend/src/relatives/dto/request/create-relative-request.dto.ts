import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

export class CreateRelativeDto {
  @ApiProperty({
    example: 'Мать',
    description: 'Тип родства',
    maxLength: 100,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  relationshipType!: string;

  @ApiProperty({
    example: 'Каримова Дилором Рустамовна',
    description: 'ФИО родственника',
    maxLength: 100,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100, {
    message: 'ФИО не должно превышать 100 символов',
  })
  fullName!: string;

  @ApiPropertyOptional({
    example: '1965-04-12',
    description: 'Дата рождения родственника',
    type: String,
    format: 'date',
  })
  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @ApiPropertyOptional({
    example: 'Учитель',
    description: 'Место работы / род занятий',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100, {
    message: 'Должность не должна превышать 100 символов',
  })
  occupation?: string;

  @ApiPropertyOptional({
    example: '+998901234567',
    description: 'Номер телефона',
    maxLength: 30,
  })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  @Matches(/^\+[1-9]\d{7,14}$/, {
    message: 'Укажите корректный номер телефона в международном формате',
  })
  phone?: string;
}
