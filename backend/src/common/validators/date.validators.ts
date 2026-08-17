import { registerDecorator, type ValidationOptions } from 'class-validator';

function isIsoDate(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value);
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
