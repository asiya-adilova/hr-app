import { BaseService } from './base.service';
import {
  NamedReference,
  ReferenceResponseDto,
} from '../dto/reference-response.dto';

export abstract class ReferenceService extends BaseService<
  NamedReference,
  ReferenceResponseDto
> {
  protected toResponse(model: NamedReference): ReferenceResponseDto {
    return {
      id: model.id,
      name: model.name,
    };
  }

  protected getDefaultOrderBy() {
    return { name: 'asc' as const };
  }
}
