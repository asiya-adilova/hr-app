import { ErrorCode } from '../enums/error-code.enum';
import { ServiceResult } from '../response/service-result';
import { isDateBefore } from '../validators/date.validators';

export function findBirthDateOrderError<T>(dates: {
  birthDate?: Date | string | null;
  hireDate?: Date | string | null;
  passportExpireDate?: Date | string | null;
}): ServiceResult<T> | null {
  if (isDateBefore(dates.hireDate, dates.birthDate)) {
    return ServiceResult.error(
      ErrorCode.BadRequest,
      'Дата приёма не может быть раньше даты рождения',
    );
  }

  if (isDateBefore(dates.passportExpireDate, dates.birthDate)) {
    return ServiceResult.error(
      ErrorCode.BadRequest,
      'Срок действия паспорта не может быть раньше даты рождения',
    );
  }

  return null;
}
