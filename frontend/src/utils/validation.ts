export const PASSWORD_PATTERN =
  /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export const PASSWORD_HINT =
  'Минимум 8 символов, включая буквы, цифры и спецсимвол';

export function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function isPinfl(value: string): boolean {
  return /^\d{14}$/.test(value.trim());
}

export function required(value: string | number | boolean | undefined): boolean {
  if (typeof value === 'boolean') {
    return true;
  }

  return String(value ?? '').trim().length > 0;
}
