import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateEducationDto {
  @ApiProperty({
    example: 'Ташкентский государственный технический университет',
    description: 'Название учебного заведения',
    maxLength: 255,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  institutionName!: string;

  @ApiProperty({
    example: 'Информационные технологии',
    description: 'Специальность',
    maxLength: 255,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  specialty!: string;

  @ApiProperty({
    example: 3,
    description: 'Идентификатор уровня образования из справочника EducationLevel',
  })
  @Type(() => Number)
  @IsInt()
  educationLevelId!: number;

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
    example: 2022,
    description: 'Год окончания',
  })
  @Type(() => Number)
  @IsInt()
  @Min(1900)
  @Max(2100)
  graduationYear!: number;
}
