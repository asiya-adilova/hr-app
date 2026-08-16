import { ApiPropertyOptional } from '@nestjs/swagger';
import { ErrorCode } from '../enums/error-code.enum';

export class ErrorInfo {
  @ApiPropertyOptional({ enum: ErrorCode, example: ErrorCode.NotFound })
  code?: ErrorCode;

  @ApiPropertyOptional({ example: 'Сотрудник не найден' })
  message?: string;

  @ApiPropertyOptional()
  stackTrace?: string;

  @ApiPropertyOptional({
    type: 'object',
    additionalProperties: {
      type: 'array',
      items: { type: 'string' },
    },
  })
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
