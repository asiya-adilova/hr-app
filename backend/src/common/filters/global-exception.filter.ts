import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import { Response } from 'express';

import { ErrorCode } from '../enums/error-code.enum';
import { ApiResponse } from '../response/api-response';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();

    // Log unexpected exceptions on the server
    this.logger.error(
      exception instanceof Error ? exception.stack : String(exception),
    );

    // 1. NestJS HTTP exceptions
    if (exception instanceof HttpException) {
      this.handleHttpException(exception, response);
      return;
    }

    // 2. Prisma exceptions
    if (exception instanceof PrismaClientKnownRequestError) {
      this.handlePrismaException(exception, response);
      return;
    }

    // 3. Unknown/unexpected exceptions
    response
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json(ApiResponse.internalServerError('Внутренняя ошибка сервера'));
  }

  private handleHttpException(
    exception: HttpException,
    response: Response,
  ): void {
    const status: HttpStatus = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    // ValidationPipe errors
    if (
      status === HttpStatus.BAD_REQUEST &&
      typeof exceptionResponse === 'object' &&
      exceptionResponse !== null &&
      'message' in exceptionResponse &&
      Array.isArray((exceptionResponse as { message?: unknown }).message)
    ) {
      const messages = (exceptionResponse as { message: string[] }).message;

      response.status(HttpStatus.BAD_REQUEST).json({
        successful: false,
        error: {
          code: ErrorCode.ValidationError,
          message: messages[0] ?? 'Ошибка валидации',
          validationErrors: messages,
        },
      });
      return;
    }

    // Other HTTP exceptions
    const message =
      typeof exceptionResponse === 'string'
        ? exceptionResponse
        : exception.message;

    const errorCode =
      status === HttpStatus.NOT_FOUND
        ? ErrorCode.NotFound
        : status === HttpStatus.BAD_REQUEST
          ? ErrorCode.BadRequest
          : status === HttpStatus.UNAUTHORIZED
            ? ErrorCode.Unauthorized
            : status === HttpStatus.FORBIDDEN
              ? ErrorCode.Forbidden
              : ErrorCode.InternalServerError;

    response.status(status).json(ApiResponse.error(errorCode, message));
  }

  private handlePrismaException(
    exception: PrismaClientKnownRequestError,
    response: Response,
  ): void {
    switch (exception.code) {
      // Unique constraint
      case 'P2002':
        response
          .status(HttpStatus.CONFLICT)
          .json(
            ApiResponse.error(
              ErrorCode.DuplicateData,
              'Запись с указанными уникальными данными уже существует',
            ),
          );
        return;

      // Record not found
      case 'P2025':
        response
          .status(HttpStatus.NOT_FOUND)
          .json(ApiResponse.error(ErrorCode.NotFound, 'Запись не найдена'));
        return;

      // Foreign key constraint
      case 'P2003':
        response
          .status(HttpStatus.BAD_REQUEST)
          .json(
            ApiResponse.error(
              ErrorCode.BadRequest,
              'Указанная связанная запись не существует',
            ),
          );
        return;

      default:
        response
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json(
            ApiResponse.internalServerError('Ошибка при работе с базой данных'),
          );
    }
  }
}
