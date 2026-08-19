import { BaseService } from '../common/services/base.service';
import {
  NamedReference,
  ReferenceResponseDto,
} from '../common/dto/reference-response.dto';

export abstract class ReferenceService extends BaseService<
  NamedReference,
  ReferenceResponseDto
> {
  // #region PROTECTED METHODS

  protected toResponse(model: NamedReference): ReferenceResponseDto {
    return {
      id: model.id,
      name: model.name,
    };
  }

  protected getDefaultOrderBy() {
    return { name: 'asc' as const };
  }

  // #endregion
}
