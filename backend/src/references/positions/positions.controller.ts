import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { PositionsService } from './positions.service';
import { ReferenceResponseDto } from '../../common/dto/reference-response.dto';
import { toApiResponse } from '../../common/response/service-result-mapper';
import { ApiDataResponse } from '../../common/swagger/api-data-response';
import { Auth } from '../../security/decorators/auth.decorator';

@ApiTags('Positions')
@Auth()
@Controller('positions')
export class PositionsController {
  constructor(private readonly positionsService: PositionsService) {}

  @Get('search')
  @ApiOperation({ summary: 'Список должностей' })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Поиск по названию',
  })
  @ApiDataResponse(ReferenceResponseDto, { isArray: true })
  async search(@Query('search') search?: string) {
    return toApiResponse(await this.positionsService.search(search));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить должность по идентификатору' })
  @ApiParam({ name: 'id', type: Number })
  @ApiDataResponse(ReferenceResponseDto)
  async getById(@Param('id', ParseIntPipe) id: number) {
    return toApiResponse(await this.positionsService.getById(id));
  }
}
