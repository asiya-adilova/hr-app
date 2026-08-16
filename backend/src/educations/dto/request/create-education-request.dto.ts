import { ApiProperty } from '@nestjs/swagger';
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
    example: 2022,
    description: 'Год окончания',
  })
  @IsInt()
  @Min(1900)
  @Max(2100)
  graduationYear!: number;
}
