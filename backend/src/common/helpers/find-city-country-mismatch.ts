import { PrismaService } from '../../prisma/prisma.service';
import { ErrorCode } from '../enums/error-code.enum';
import { ServiceResult } from '../response/service-result';

export async function findCityCountryMismatch<T>(
  prisma: PrismaService,
  countryId?: number,
  cityId?: number,
): Promise<ServiceResult<T> | null> {
  if (countryId == null || cityId == null) {
    return null;
  }

  const city = await prisma.city.findFirst({
    where: { id: cityId },
  });

  if (!city) {
    return ServiceResult.error(ErrorCode.NotFound, 'Город не найден');
  }

  if (city.countryId !== countryId) {
    return ServiceResult.error(
      ErrorCode.BadRequest,
      'Город не относится к выбранной стране',
    );
  }

  return null;
}
