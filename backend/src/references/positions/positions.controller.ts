import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { PositionsService } from './positions.service';
import { ReferenceResponseDto } from '../../common/dto/reference-response.dto';
import { toApiResponse } from '../../common/response/service-result-mapper';
import { ApiDataResponse } from '../../common/swagger/api-data-response';
import { Auth } from '../../auth/decorators/auth.decorator';

@ApiTags('Positions')
@Auth()
@Controller('positions')
export class PositionsController {
  constructor(private readonly positionsService: PositionsService) {}

  @Get()
  @ApiOperation({ summary: 'Список должностей' })
  @ApiDataResponse(ReferenceResponseDto, { isArray: true })
  async getAll() {
    return toApiResponse(await this.positionsService.getAll());
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить должность по идентификатору' })
  @ApiParam({ name: 'id', type: Number })
  @ApiDataResponse(ReferenceResponseDto)
  async getById(@Param('id', ParseIntPipe) id: number) {
    return toApiResponse(await this.positionsService.getById(id));
  }
}
