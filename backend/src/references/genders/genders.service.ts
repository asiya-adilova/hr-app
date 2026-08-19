import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ReferenceService } from '../../common/services/reference.service';

@Injectable()
export class GendersService extends ReferenceService {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  // #region PROTECTED METHODS

  protected readonly notFoundMessage = 'Пол не найден';

  protected getDelegate() {
    return this.prisma.gender;
  }

  // #endregion
}
