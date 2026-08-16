import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ReferenceService } from '../../common/services/reference.service';

@Injectable()
export class EducationLevelsService extends ReferenceService {
  protected readonly notFoundMessage = 'Уровень образования не найден';

  constructor(prisma: PrismaService) {
    super(prisma);
  }

  protected getDelegate() {
    return this.prisma.educationLevel;
  }
}
