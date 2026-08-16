import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { DriverLicenseCategoriesService } from './driver-license-categories.service';
import { ReferenceResponseDto } from '../../common/dto/reference-response.dto';
import { toApiResponse } from '../../common/response/service-result-mapper';
import { ApiDataResponse } from '../../common/swagger/api-data-response';

@ApiTags('Driver license categories')
@Controller('driver-license-categories')
export class DriverLicenseCategoriesController {
  constructor(
    private readonly driverLicenseCategoriesService: DriverLicenseCategoriesService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Список категорий водительских прав' })
  @ApiDataResponse(ReferenceResponseDto, { isArray: true })
  async getAll() {
    return toApiResponse(await this.driverLicenseCategoriesService.getAll());
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Получить категорию водительских прав по идентификатору',
  })
  @ApiParam({ name: 'id', type: Number })
  @ApiDataResponse(ReferenceResponseDto)
  async getById(@Param('id', ParseIntPipe) id: number) {
    return toApiResponse(await this.driverLicenseCategoriesService.getById(id));
  }
}
