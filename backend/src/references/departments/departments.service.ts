import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ReferenceService } from '../../common/services/reference.service';

@Injectable()
export class DepartmentsService extends ReferenceService {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  // #region PROTECTED METHODS

  protected readonly notFoundMessage = 'Подразделение не найдено';

  protected getDelegate() {
    return this.prisma.department;
  }

  // #endregion
}
