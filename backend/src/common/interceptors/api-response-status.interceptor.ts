import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { Response } from 'express';
import { errorCodeToHttpStatus } from '../http/error-http-status';
import type { ApiResponse } from '../response/api-response';

@Injectable()
export class ApiResponseStatusInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const response = context.switchToHttp().getResponse<Response>();

    return next.handle().pipe(
      map((body: unknown) => {
        if (isFailedApiResponse(body) && !response.headersSent) {
          response.status(errorCodeToHttpStatus(body.error?.code));
        }

        return body;
      }),
    );
  }
}

function isFailedApiResponse(
  body: unknown,
): body is ApiResponse<unknown> {
  return (
    typeof body === 'object' &&
    body !== null &&
    'successful' in body &&
    (body as ApiResponse<unknown>).successful === false
  );
}
