import { ApiResponse } from './api-response';
import { ServiceResult } from './service-result';
import { ErrorCode } from '../enums/error-code.enum';

export function toApiResponse<T>(result: ServiceResult<T>): ApiResponse<T> {
  if (result.successful) {
    return ApiResponse.success(result.result as T);
  }

  return ApiResponse.error(
    result.errorInfo?.code ?? ErrorCode.InternalServerError,
    result.errorInfo?.message ?? 'Неизвестная ошибка',
  );
}
