import { ApiProperty } from '@nestjs/swagger';

export class ReferenceResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'Высшее' })
  name!: string;
}

export type NamedReference = {
  id: number;
  name: string;
};
