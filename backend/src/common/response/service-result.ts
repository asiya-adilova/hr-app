import { ErrorCode } from '../enums/error-code.enum';
import { ErrorInfo } from './error-info';

export class ServiceResult<T = void> {
  successful: boolean;
  result?: T;
  errorInfo?: ErrorInfo;

  private constructor(successful: boolean, result?: T, errorInfo?: ErrorInfo) {
    this.successful = successful;
    this.result = result;
    this.errorInfo = errorInfo;
  }

  static success(): ServiceResult<void>;

  static success<T>(result: T): ServiceResult<T>;

  static success<T>(result?: T): ServiceResult<T | void> {
    return new ServiceResult<T | void>(true, result);
  }

  static error<T>(code: ErrorCode, message: string): ServiceResult<T> {
    return new ServiceResult<T>(false, undefined, new ErrorInfo(code, message));
  }
}
