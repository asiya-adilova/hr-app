import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ReferenceService } from '../../common/services/reference.service';

@Injectable()
export class EmploymentTypesService extends ReferenceService {
  protected readonly notFoundMessage = 'Тип занятости не найден';

  constructor(prisma: PrismaService) {
    super(prisma);
  }

  protected getDelegate() {
    return this.prisma.employmentType;
  }
}
