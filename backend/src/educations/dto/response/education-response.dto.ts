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

  @ApiPropertyOptional({ example: 'Программная инженерия' })
  qualification?: string;

  @ApiPropertyOptional({ example: 2018 })
  startYear?: number;

  @ApiPropertyOptional({ example: 2022 })
  graduationYear?: number;

  @ApiPropertyOptional({ example: 'Диплом с отличием' })
  additionalInfo?: string;
}
