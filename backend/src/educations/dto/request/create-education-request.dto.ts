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
    maxLength: 100,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100, {
    message: 'Название учебного заведения не должно превышать 100 символов',
  })
  institutionName!: string;

  @ApiProperty({
    example: 'Информационные технологии',
    description: 'Специальность',
    maxLength: 100,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100, {
    message: 'Специальность не должна превышать 100 символов',
  })
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
    description: 'Год окончания. Не может быть раньше года рождения сотрудника.',
  })
  @Type(() => Number)
  @IsInt()
  @Min(1900)
  @Max(2100)
  graduationYear!: number;
}
