import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
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
  @ApiDataResponse(ReferenceResponseDto, { isArray: true })
  async getAll() {
    return toApiResponse(await this.maritalStatusesService.getAll());
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить семейное положение по идентификатору' })
  @ApiParam({ name: 'id', type: Number })
  @ApiDataResponse(ReferenceResponseDto)
  async getById(@Param('id', ParseIntPipe) id: number) {
    return toApiResponse(await this.maritalStatusesService.getById(id));
  }
}
