import { PrismaService } from '../../prisma/prisma.service';
import { ErrorCode } from '../enums/error-code.enum';
import { ErrorMessage } from '../messages/error-message';
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
    return ServiceResult.error(ErrorCode.NotFound, ErrorMessage.cityNotFound);
  }

  if (city.countryId !== countryId) {
    return ServiceResult.error(
      ErrorCode.BadRequest,
      ErrorMessage.cityCountryMismatch,
    );
  }

  return null;
}
