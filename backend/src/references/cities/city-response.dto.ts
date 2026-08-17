import { ApiProperty } from '@nestjs/swagger';
import { ReferenceResponseDto } from '../../common/dto/reference-response.dto';

export class CityResponseDto extends ReferenceResponseDto {
  @ApiProperty({ example: 1, description: 'Идентификатор страны' })
  countryId!: number;
}
