import {
  registerDecorator,
  type ValidationArguments,
  type ValidationOptions,
} from 'class-validator';

function isIsoDate(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value);
}

function toDateOnly(value: Date | string): string {
  if (typeof value === 'string') {
    return value.slice(0, 10);
  }

  return value.toISOString().slice(0, 10);
}

export function toIsoDateKey(value: string | Date | null | undefined): string {
  if (value == null || value === '') {
    return '';
  }

  return toDateOnly(value);
}

export function localTodayIsoDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function isDateBefore(
  value: Date | string | null | undefined,
  minDate: Date | string | null | undefined,
): boolean {
  if (value == null || minDate == null || value === '' || minDate === '') {
    return false;
  }

  return toDateOnly(value) < toDateOnly(minDate);
}

export function yearFromDate(
  value: Date | string | null | undefined,
): number | undefined {
  if (value == null || (typeof value === 'string' && value === '')) {
    return undefined;
  }

  const year = Number(toDateOnly(value).slice(0, 4));
  return Number.isFinite(year) ? year : undefined;
}

export function IsDateOnOrAfterField(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      name: 'isDateOnOrAfterField',
      target: object.constructor,
      propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: unknown, args: ValidationArguments) {
          const related = (args.object as Record<string, unknown>)[
            args.constraints[0] as string
          ];

          if (!isIsoDate(value)) {
            return false;
          }

          if (!isIsoDate(related)) {
            return true;
          }

          return value.slice(0, 10) >= related.slice(0, 10);
        },
      },
    });
  };
}

export function IsDateOnOrBefore(
  maxDate: string,
  validationOptions?: ValidationOptions,
) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      name: 'isDateOnOrBefore',
      target: object.constructor,
      propertyName,
      constraints: [maxDate],
      options: validationOptions,
      validator: {
        validate(value: unknown) {
          return isIsoDate(value) && value.slice(0, 10) <= maxDate;
        },
      },
    });
  };
}

export function IsDateOnOrAfterToday(validationOptions?: ValidationOptions) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      name: 'isDateOnOrAfterToday',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown) {
          const today = new Date().toISOString().slice(0, 10);
          return isIsoDate(value) && value.slice(0, 10) >= today;
        },
      },
    });
  };
}

export function IsDateOnOrBeforeToday(validationOptions?: ValidationOptions) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      name: 'isDateOnOrBeforeToday',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown) {
          const today = new Date().toISOString().slice(0, 10);
          return isIsoDate(value) && value.slice(0, 10) <= today;
        },
      },
    });
  };
}
