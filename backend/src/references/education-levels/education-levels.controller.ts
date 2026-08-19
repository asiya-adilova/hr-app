import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { EducationLevelsService } from './education-levels.service';
import { ReferenceResponseDto } from '../../common/dto/reference-response.dto';
import { toApiResponse } from '../../common/response/service-result-mapper';
import { ApiDataResponse } from '../../common/swagger/api-data-response';
import { Auth } from '../../security/decorators/auth.decorator';

@ApiTags('Education levels')
@Auth()
@Controller('education-levels')
export class EducationLevelsController {
  constructor(
    private readonly educationLevelsService: EducationLevelsService,
  ) {}

  @Get('search')
  @ApiOperation({ summary: 'Список уровней образования' })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Поиск по названию',
  })
  @ApiDataResponse(ReferenceResponseDto, { isArray: true })
  async search(@Query('search') search?: string) {
    return toApiResponse(await this.educationLevelsService.search(search));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить уровень образования по идентификатору' })
  @ApiParam({ name: 'id', type: Number })
  @ApiDataResponse(ReferenceResponseDto)
  async getById(@Param('id', ParseIntPipe) id: number) {
    return toApiResponse(await this.educationLevelsService.getById(id));
  }
}
