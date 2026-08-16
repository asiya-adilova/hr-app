import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RelativeResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({
    example: 'Мать',
  })
  relationshipType!: string;

  @ApiProperty({
    example: 'Каримова Дилором Рустамовна',
  })
  fullName!: string;

  @ApiPropertyOptional({
    example: '1965-04-12',
  })
  birthDate?: Date;

  @ApiPropertyOptional({
    example: 'Учитель',
  })
  occupation?: string;

  @ApiPropertyOptional({
    example: '+998901234567',
  })
  phone?: string;
}
