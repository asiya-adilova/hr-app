import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class WorkExperienceResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({
    example: 'ABC Technologies',
  })
  companyName!: string;

  @ApiProperty({
    example: 2,
    description: 'Идентификатор должности из справочника Position',
  })
  positionId!: number;

  @ApiProperty({
    example: 'Software Engineer',
    description: 'Название должности',
  })
  positionName!: string;

  @ApiProperty({ example: 1 })
  countryId!: number;

  @ApiProperty({ example: 'Узбекистан' })
  countryName!: string;

  @ApiProperty({ example: 1 })
  cityId!: number;

  @ApiProperty({ example: 'Ташкент' })
  cityName!: string;

  @ApiProperty({
    example: '2019-06-01',
  })
  startDate!: Date;

  @ApiPropertyOptional({
    example: '2022-03-15',
  })
  endDate?: Date;

  @ApiProperty({
    example: false,
  })
  isCurrent!: boolean;

  @ApiPropertyOptional({
    example: 'Разработка корпоративных информационных систем',
  })
  responsibilities?: string;
}
