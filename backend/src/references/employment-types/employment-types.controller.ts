import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { EmploymentTypesService } from './employment-types.service';
import { ReferenceResponseDto } from '../../common/dto/reference-response.dto';
import { toApiResponse } from '../../common/response/service-result-mapper';
import { ApiDataResponse } from '../../common/swagger/api-data-response';
import { Auth } from '../../security/decorators/auth.decorator';

@ApiTags('Employment types')
@Auth()
@Controller('employment-types')
export class EmploymentTypesController {
  constructor(
    private readonly employmentTypesService: EmploymentTypesService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Список типов занятости' })
  @ApiDataResponse(ReferenceResponseDto, { isArray: true })
  async getAll() {
    return toApiResponse(await this.employmentTypesService.getAll());
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить тип занятости по идентификатору' })
  @ApiParam({ name: 'id', type: Number })
  @ApiDataResponse(ReferenceResponseDto)
  async getById(@Param('id', ParseIntPipe) id: number) {
    return toApiResponse(await this.employmentTypesService.getById(id));
  }
}
