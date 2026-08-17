import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class EducationResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({
    example: 'Ташкентский государственный технический университет',
  })
  institutionName!: string;

  @ApiPropertyOptional({ example: 'Информационные технологии' })
  specialty?: string;

  @ApiProperty({
    example: 3,
    description: 'Идентификатор уровня образования из справочника EducationLevel',
  })
  educationLevelId!: number;

  @ApiProperty({
    example: 'Высшее',
    description: 'Название уровня образования',
  })
  educationLevelName!: string;

  @ApiProperty({ example: 1 })
  countryId!: number;

  @ApiProperty({ example: 'Узбекистан' })
  countryName!: string;

  @ApiProperty({ example: 1 })
  cityId!: number;

  @ApiProperty({ example: 'Ташкент' })
  cityName!: string;

  @ApiPropertyOptional({ example: 2022 })
  graduationYear?: number;
}
