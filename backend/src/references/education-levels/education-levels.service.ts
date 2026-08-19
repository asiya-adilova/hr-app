import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ReferenceService } from '../reference.service';

@Injectable()
export class EducationLevelsService extends ReferenceService {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  // #region PROTECTED METHODS

  protected getDelegate() {
    return this.prisma.educationLevel;
  }

  // #endregion
}
