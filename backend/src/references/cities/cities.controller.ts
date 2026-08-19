import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CitiesService } from './cities.service';
import { CityResponseDto } from './city-response.dto';
import { toApiResponse } from '../../common/response/service-result-mapper';
import { ApiDataResponse } from '../../common/swagger/api-data-response';
import { Auth } from '../../security/decorators/auth.decorator';

@ApiTags('Cities')
@Auth()
@Controller('cities')
export class CitiesController {
  constructor(private readonly citiesService: CitiesService) {}

  @Get('search')
  @ApiOperation({ summary: 'Список городов' })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Поиск по названию',
  })
  @ApiDataResponse(CityResponseDto, { isArray: true })
  async search(@Query('search') search?: string) {
    return toApiResponse(await this.citiesService.search(search));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить город по идентификатору' })
  @ApiParam({ name: 'id', type: Number })
  @ApiDataResponse(CityResponseDto)
  async getById(@Param('id', ParseIntPipe) id: number) {
    return toApiResponse(await this.citiesService.getById(id));
  }
}
