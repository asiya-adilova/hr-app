import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BaseService } from '../../common/services/base.service';
import { CityResponseDto } from './city-response.dto';

type CityRecord = {
  id: number;
  name: string;
  countryId: number;
};

@Injectable()
export class CitiesService extends BaseService<CityRecord, CityResponseDto> {
  protected readonly notFoundMessage = 'Город не найден';

  constructor(prisma: PrismaService) {
    super(prisma);
  }

  protected getDelegate() {
    return this.prisma.city;
  }

  protected toResponse(model: CityRecord): CityResponseDto {
    return {
      id: model.id,
      name: model.name,
      countryId: model.countryId,
    };
  }

  protected getDefaultOrderBy() {
    return { name: 'asc' as const };
  }
}
