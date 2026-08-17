import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { DriverLicenseCategoriesService } from './driver-license-categories.service';
import { ReferenceResponseDto } from '../../common/dto/reference-response.dto';
import { toApiResponse } from '../../common/response/service-result-mapper';
import { ApiDataResponse } from '../../common/swagger/api-data-response';
import { Auth } from '../../security/decorators/auth.decorator';

@ApiTags('Driver license categories')
@Auth()
@Controller('driver-license-categories')
export class DriverLicenseCategoriesController {
  constructor(
    private readonly driverLicenseCategoriesService: DriverLicenseCategoriesService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Список категорий водительских прав' })
  @ApiQuery({ name: 'search', required: false, description: 'Поиск по названию' })
  @ApiDataResponse(ReferenceResponseDto, { isArray: true })
  async getAll(@Query('search') search?: string) {
    return toApiResponse(
      await this.driverLicenseCategoriesService.search(search),
    );
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
