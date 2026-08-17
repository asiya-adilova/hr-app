import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
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
  @ApiQuery({ name: 'search', required: false, description: 'Поиск по названию' })
  @ApiDataResponse(ReferenceResponseDto, { isArray: true })
  async getAll(@Query('search') search?: string) {
    return toApiResponse(await this.employmentTypesService.search(search));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить тип занятости по идентификатору' })
  @ApiParam({ name: 'id', type: Number })
  @ApiDataResponse(ReferenceResponseDto)
  async getById(@Param('id', ParseIntPipe) id: number) {
    return toApiResponse(await this.employmentTypesService.getById(id));
  }
}
