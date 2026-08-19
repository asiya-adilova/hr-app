import { HttpStatus } from '@nestjs/common';
import { ErrorCode } from '../enums/error-code.enum';

export function errorCodeToHttpStatus(code?: ErrorCode): HttpStatus {
  switch (code) {
    case ErrorCode.BadRequest:
    case ErrorCode.ValidationError:
      return HttpStatus.BAD_REQUEST;
    case ErrorCode.Unauthorized:
    case ErrorCode.InvalidToken:
      return HttpStatus.UNAUTHORIZED;
    case ErrorCode.Forbidden:
      return HttpStatus.FORBIDDEN;
    case ErrorCode.NotFound:
      return HttpStatus.NOT_FOUND;
    case ErrorCode.DuplicateData:
      return HttpStatus.CONFLICT;
    case ErrorCode.TooManyRequests:
      return HttpStatus.TOO_MANY_REQUESTS;
    case ErrorCode.ServiceUnreachable:
      return HttpStatus.SERVICE_UNAVAILABLE;
    case ErrorCode.InternalServerError:
    case ErrorCode.Unknown:
    default:
      return HttpStatus.INTERNAL_SERVER_ERROR;
  }
}

export function httpStatusToErrorCode(status: number): ErrorCode {
  switch (status) {
    case HttpStatus.BAD_REQUEST:
      return ErrorCode.BadRequest;
    case HttpStatus.UNAUTHORIZED:
      return ErrorCode.Unauthorized;
    case HttpStatus.FORBIDDEN:
      return ErrorCode.Forbidden;
    case HttpStatus.NOT_FOUND:
      return ErrorCode.NotFound;
    case HttpStatus.CONFLICT:
      return ErrorCode.DuplicateData;
    case HttpStatus.TOO_MANY_REQUESTS:
      return ErrorCode.TooManyRequests;
    case HttpStatus.SERVICE_UNAVAILABLE:
      return ErrorCode.ServiceUnreachable;
    default:
      return status >= 500
        ? ErrorCode.InternalServerError
        : ErrorCode.BadRequest;
  }
}
