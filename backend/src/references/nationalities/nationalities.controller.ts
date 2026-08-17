import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { NationalitiesService } from './nationalities.service';
import { ReferenceResponseDto } from '../../common/dto/reference-response.dto';
import { toApiResponse } from '../../common/response/service-result-mapper';
import { ApiDataResponse } from '../../common/swagger/api-data-response';
import { Auth } from '../../security/decorators/auth.decorator';

@ApiTags('Nationalities')
@Auth()
@Controller('nationalities')
export class NationalitiesController {
  constructor(private readonly nationalitiesService: NationalitiesService) {}

  @Get()
  @ApiOperation({ summary: 'Список национальностей' })
  @ApiQuery({ name: 'search', required: false, description: 'Поиск по названию' })
  @ApiDataResponse(ReferenceResponseDto, { isArray: true })
  async getAll(@Query('search') search?: string) {
    return toApiResponse(await this.nationalitiesService.search(search));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить национальность по идентификатору' })
  @ApiParam({ name: 'id', type: Number })
  @ApiDataResponse(ReferenceResponseDto)
  async getById(@Param('id', ParseIntPipe) id: number) {
    return toApiResponse(await this.nationalitiesService.getById(id));
  }
}
