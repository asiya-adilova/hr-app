import { isValidPhoneNumber } from 'react-phone-number-input/max';

export const PASSWORD_PATTERN =
  /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export const PASSWORD_HINT =
  'Минимум 8 символов, включая буквы, цифры и спецсимвол';

export const BIRTH_DATE_MAX = '2010-12-31';

export function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function emailFormatError(value: string): string | undefined {
  return value && !isEmail(value) ? 'Некорректный email' : undefined;
}

export function isPinfl(value: string): boolean {
  return /^\d{14}$/.test(value.trim());
}

export function isPassportSeries(value: string): boolean {
  return /^[A-Za-zА-Яа-яЁё]{2}$/.test(value.trim());
}

export function isPassportNumber(value: string): boolean {
  return /^\d{1,7}$/.test(value.trim());
}

export function todayIsoDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function isBirthDateAllowed(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && value <= BIRTH_DATE_MAX;
}

export function isPassportExpired(expireDate: string): boolean {
  return expireDate < todayIsoDate();
}

export function digitsOnly(value: string, maxLength?: number): string {
  const digits = value.replace(/\D/g, '');
  return maxLength ? digits.slice(0, maxLength) : digits;
}

export function lettersOnly(value: string, maxLength?: number): string {
  const letters = value.replace(/[^A-Za-zА-Яа-яЁё]/g, '').toUpperCase();
  return maxLength ? letters.slice(0, maxLength) : letters;
}

export function isValidPhone(value: string): boolean {
  return Boolean(value) && isValidPhoneNumber(value);
}

export function required(value: string | number | boolean | undefined): boolean {
  if (typeof value === 'boolean') {
    return true;
  }

  return String(value ?? '').trim().length > 0;
}
