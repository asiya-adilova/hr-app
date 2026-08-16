import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { CitizenshipsService } from './citizenships.service';
import { ReferenceResponseDto } from '../../common/dto/reference-response.dto';
import { toApiResponse } from '../../common/response/service-result-mapper';
import { ApiDataResponse } from '../../common/swagger/api-data-response';
import { Auth } from '../../auth/decorators/auth.decorator';

@ApiTags('Citizenships')
@Auth()
@Controller('citizenships')
export class CitizenshipsController {
  constructor(private readonly citizenshipsService: CitizenshipsService) {}

  @Get()
  @ApiOperation({ summary: 'Список гражданств' })
  @ApiDataResponse(ReferenceResponseDto, { isArray: true })
  async getAll() {
    return toApiResponse(await this.citizenshipsService.getAll());
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить гражданство по идентификатору' })
  @ApiParam({ name: 'id', type: Number })
  @ApiDataResponse(ReferenceResponseDto)
  async getById(@Param('id', ParseIntPipe) id: number) {
    return toApiResponse(await this.citizenshipsService.getById(id));
  }
}
