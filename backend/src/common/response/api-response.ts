import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ErrorCode } from '../enums/error-code.enum';
import { ErrorInfo } from './error-info';

export class ApiResponse<T = null> {
  @ApiProperty({ example: true })
  successful: boolean;

  @ApiPropertyOptional()
  data?: T;

  @ApiPropertyOptional({ type: ErrorInfo })
  error?: ErrorInfo;

  private constructor(successful: boolean, data?: T, error?: ErrorInfo) {
    this.successful = successful;
    this.data = data;
    this.error = error;
  }

  static success(): ApiResponse<null>;

  static success<T>(data: T): ApiResponse<T>;

  static success<T>(data?: T): ApiResponse<T | null> {
    return new ApiResponse<T | null>(true, data ?? null);
  }

  static error<T>(code: ErrorCode, message: string): ApiResponse<T> {
    return new ApiResponse<T>(false, undefined, new ErrorInfo(code, message));
  }

  static notFound<T>(message = 'Не найдено'): ApiResponse<T> {
    return ApiResponse.error(ErrorCode.NotFound, message);
  }

  static badRequest<T>(message = 'Некорректный запрос'): ApiResponse<T> {
    return ApiResponse.error(ErrorCode.BadRequest, message);
  }

  static internalServerError<T>(
    message = 'Внутренняя ошибка сервера',
  ): ApiResponse<T> {
    return ApiResponse.error(ErrorCode.InternalServerError, message);
  }
}
