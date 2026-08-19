import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ReferenceService } from '../../common/services/reference.service';

@Injectable()
export class MaritalStatusesService extends ReferenceService {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  // #region PROTECTED METHODS

  protected readonly notFoundMessage = 'Семейное положение не найдено';

  protected getDelegate() {
    return this.prisma.maritalStatus;
  }

  // #endregion
}
