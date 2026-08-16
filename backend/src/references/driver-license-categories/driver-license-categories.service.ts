import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ReferenceService } from '../../common/services/reference.service';

@Injectable()
export class DriverLicenseCategoriesService extends ReferenceService {
  protected readonly notFoundMessage = 'Категория водительских прав не найдена';

  constructor(prisma: PrismaService) {
    super(prisma);
  }

  protected getDelegate() {
    return this.prisma.driverLicenseCategory;
  }
}
