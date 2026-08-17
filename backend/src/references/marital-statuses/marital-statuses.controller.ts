import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { MaritalStatusesService } from './marital-statuses.service';
import { ReferenceResponseDto } from '../../common/dto/reference-response.dto';
import { toApiResponse } from '../../common/response/service-result-mapper';
import { ApiDataResponse } from '../../common/swagger/api-data-response';
import { Auth } from '../../security/decorators/auth.decorator';

@ApiTags('Marital statuses')
@Auth()
@Controller('marital-statuses')
export class MaritalStatusesController {
  constructor(
    private readonly maritalStatusesService: MaritalStatusesService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Список семейных положений' })
  @ApiQuery({ name: 'search', required: false, description: 'Поиск по названию' })
  @ApiDataResponse(ReferenceResponseDto, { isArray: true })
  async getAll(@Query('search') search?: string) {
    return toApiResponse(await this.maritalStatusesService.search(search));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить семейное положение по идентификатору' })
  @ApiParam({ name: 'id', type: Number })
  @ApiDataResponse(ReferenceResponseDto)
  async getById(@Param('id', ParseIntPipe) id: number) {
    return toApiResponse(await this.maritalStatusesService.getById(id));
  }
}
