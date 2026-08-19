import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ReferenceService } from '../reference.service';

@Injectable()
export class PositionsService extends ReferenceService {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  // #region PROTECTED METHODS

  protected getDelegate() {
    return this.prisma.position;
  }

  // #endregion
}
