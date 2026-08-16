import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ReferenceService } from '../../common/services/reference.service';

@Injectable()
export class CitizenshipsService extends ReferenceService {
  protected readonly notFoundMessage = 'Гражданство не найдено';

  constructor(prisma: PrismaService) {
    super(prisma);
  }

  protected getDelegate() {
    return this.prisma.citizenship;
  }
}
