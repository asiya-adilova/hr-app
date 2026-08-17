import { ApiProperty } from '@nestjs/swagger';
import { ReferenceResponseDto } from '../../common/dto/reference-response.dto';
import { CityResponseDto } from '../cities/city-response.dto';

export class ReferenceMapResponseDto {
  @ApiProperty({ type: [ReferenceResponseDto] })
  genders!: ReferenceResponseDto[];

  @ApiProperty({ type: [ReferenceResponseDto] })
  citizenships!: ReferenceResponseDto[];

  @ApiProperty({ type: [ReferenceResponseDto] })
  nationalities!: ReferenceResponseDto[];

  @ApiProperty({ type: [ReferenceResponseDto] })
  departments!: ReferenceResponseDto[];

  @ApiProperty({ type: [ReferenceResponseDto] })
  positions!: ReferenceResponseDto[];

  @ApiProperty({ type: [ReferenceResponseDto] })
  employmentTypes!: ReferenceResponseDto[];

  @ApiProperty({ type: [ReferenceResponseDto] })
  educationLevels!: ReferenceResponseDto[];

  @ApiProperty({ type: [ReferenceResponseDto] })
  maritalStatuses!: ReferenceResponseDto[];

  @ApiProperty({ type: [ReferenceResponseDto] })
  driverLicenseCategories!: ReferenceResponseDto[];

  @ApiProperty({ type: [ReferenceResponseDto] })
  countries!: ReferenceResponseDto[];

  @ApiProperty({ type: [CityResponseDto] })
  cities!: CityResponseDto[];
}
