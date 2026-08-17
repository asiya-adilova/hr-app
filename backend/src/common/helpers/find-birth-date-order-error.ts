import { ErrorCode } from '../enums/error-code.enum';
import { ServiceResult } from '../response/service-result';
import { isDateBefore, yearFromDate } from '../validators/date.validators';

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

export function findGraduationYearBeforeBirthError<T>(
  graduationYear: number | undefined,
  birthDate?: Date | string | null,
): ServiceResult<T> | null {
  if (graduationYear == null) {
    return null;
  }

  const birthYear = yearFromDate(birthDate);
  if (birthYear == null) {
    return null;
  }

  if (graduationYear < birthYear) {
    return ServiceResult.error(
      ErrorCode.BadRequest,
      'Год окончания не может быть раньше года рождения',
    );
  }

  return null;
}

export function findExperienceDatesBeforeBirthError<T>(dates: {
  birthDate?: Date | string | null;
  startDate?: Date | string | null;
  endDate?: Date | string | null;
}): ServiceResult<T> | null {
  if (isDateBefore(dates.startDate, dates.birthDate)) {
    return ServiceResult.error(
      ErrorCode.BadRequest,
      'Дата начала не может быть раньше даты рождения',
    );
  }

  if (isDateBefore(dates.endDate, dates.birthDate)) {
    return ServiceResult.error(
      ErrorCode.BadRequest,
      'Дата окончания не может быть раньше даты рождения',
    );
  }

  return null;
}
