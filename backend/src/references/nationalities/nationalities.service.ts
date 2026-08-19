import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ReferenceService } from '../../common/services/reference.service';

@Injectable()
export class NationalitiesService extends ReferenceService {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  // #region PROTECTED METHODS

  protected readonly notFoundMessage = 'Национальность не найдена';

  protected getDelegate() {
    return this.prisma.nationality;
  }

  // #endregion
}
