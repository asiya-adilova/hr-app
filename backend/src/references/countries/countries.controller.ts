import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { CountriesService } from './countries.service';
import { ReferenceResponseDto } from '../../common/dto/reference-response.dto';
import { toApiResponse } from '../../common/response/service-result-mapper';
import { ApiDataResponse } from '../../common/swagger/api-data-response';
import { Auth } from '../../security/decorators/auth.decorator';

@ApiTags('Countries')
@Auth()
@Controller('countries')
export class CountriesController {
  constructor(private readonly countriesService: CountriesService) {}

  @Get()
  @ApiOperation({ summary: 'Список стран' })
  @ApiDataResponse(ReferenceResponseDto, { isArray: true })
  async getAll() {
    return toApiResponse(await this.countriesService.getAll());
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить страну по идентификатору' })
  @ApiParam({ name: 'id', type: Number })
  @ApiDataResponse(ReferenceResponseDto)
  async getById(@Param('id', ParseIntPipe) id: number) {
    return toApiResponse(await this.countriesService.getById(id));
  }
}
