import { PrismaService } from '../../prisma/prisma.service';
import { ErrorCode } from '../enums/error-code.enum';
import { ServiceResult } from '../response/service-result';

export async function ensureEmployeeExists(
  prisma: PrismaService,
  employeeId: number,
): Promise<ServiceResult<void>> {
  const employee = await prisma.employee.findFirst({
    where: { id: employeeId },
  });

  if (!employee) {
    return ServiceResult.error(ErrorCode.NotFound, 'Сотрудник не найден');
  }

  return ServiceResult.success();
}
