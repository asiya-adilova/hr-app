import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ReferenceService } from '../../common/services/reference.service';

@Injectable()
export class DriverLicenseCategoriesService extends ReferenceService {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  // #region PROTECTED METHODS

  protected readonly notFoundMessage = 'Категория водительских прав не найдена';

  protected getDelegate() {
    return this.prisma.driverLicenseCategory;
  }

  // #endregion
}
