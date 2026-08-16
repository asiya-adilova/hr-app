import { ErrorCode } from '../enums/error-code.enum';

export class ErrorInfo {
  code?: ErrorCode;
  message?: string;
  stackTrace?: string;
  validationErrors?: Record<string, string[]>;

  constructor(
    code?: ErrorCode,
    message?: string,
    validationErrors?: Record<string, string[]>,
  ) {
    this.code = code;
    this.message = message;
    this.validationErrors = validationErrors;
  }
}
