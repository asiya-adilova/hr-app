import { applyDecorators, type Type } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';
import { ErrorInfo } from '../response/error-info';
import { PageInfo } from '../response/paged-result';

export function ApiDataResponse(
  model: Type<unknown>,
  options?: { paged?: boolean; isArray?: boolean },
) {
  const dataSchema = options?.paged
    ? {
        type: 'object',
        properties: {
          data: {
            type: 'array',
            items: { $ref: getSchemaPath(model) },
          },
          paging: { $ref: getSchemaPath(PageInfo) },
        },
      }
    : options?.isArray
      ? {
          type: 'array',
          items: { $ref: getSchemaPath(model) },
        }
      : { $ref: getSchemaPath(model) };

  return applyDecorators(
    ApiExtraModels(ErrorInfo, PageInfo, model),
    ApiOkResponse({
      schema: {
        type: 'object',
        properties: {
          successful: { type: 'boolean', example: true },
          data: dataSchema,
          error: { $ref: getSchemaPath(ErrorInfo) },
        },
      },
    }),
  );
}
