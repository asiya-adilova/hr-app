import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ReferenceService } from '../../common/services/reference.service';

@Injectable()
export class NationalitiesService extends ReferenceService {
  protected readonly notFoundMessage = 'Национальность не найдена';

  constructor(prisma: PrismaService) {
    super(prisma);
  }

  protected getDelegate() {
    return this.prisma.nationality;
  }
}
