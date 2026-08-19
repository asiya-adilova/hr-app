import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { WorkExperiencesService } from './work-experiences.service';
import { CreateWorkExperienceDto } from './dto/request/create-work-experience-request.dto';
import { ReplaceWorkExperiencesDto } from './dto/request/replace-work-experiences-request.dto';
import { UpdateWorkExperienceDto } from './dto/request/update-work-experience-request.dto';
import { WorkExperienceResponseDto } from './dto/response/work-experience-response.dto';
import { toApiResponse } from '../common/response/service-result-mapper';
import { ApiDataResponse } from '../common/swagger/api-data-response';
import { Auth } from '../security/decorators/auth.decorator';

@ApiTags('Work experiences')
@Auth()
@Controller('employees/:employeeId/work-experiences')
export class WorkExperiencesController {
  constructor(
    private readonly workExperiencesService: WorkExperiencesService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Список опыта работы сотрудника' })
  @ApiParam({ name: 'employeeId', type: Number })
  @ApiDataResponse(WorkExperienceResponseDto, { isArray: true })
  async getAll(@Param('employeeId', ParseIntPipe) employeeId: number) {
    const result =
      await this.workExperiencesService.getAllByEmployeeId(employeeId);

    return toApiResponse(result);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить опыт работы по идентификатору' })
  @ApiParam({ name: 'employeeId', type: Number })
  @ApiParam({ name: 'id', type: Number })
  @ApiDataResponse(WorkExperienceResponseDto)
  async getById(
    @Param('employeeId', ParseIntPipe) employeeId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const result = await this.workExperiencesService.getById(id, {
      employeeId,
    });

    return toApiResponse(result);
  }

  @Post()
  @ApiOperation({ summary: 'Добавить опыт работы сотрудника' })
  @ApiParam({ name: 'employeeId', type: Number })
  @ApiBody({ type: CreateWorkExperienceDto })
  @ApiDataResponse(WorkExperienceResponseDto)
  async create(
    @Param('employeeId', ParseIntPipe) employeeId: number,
    @Body() dto: CreateWorkExperienceDto,
  ) {
    const result = await this.workExperiencesService.create(dto, {
      employeeId,
    });

    return toApiResponse(result);
  }

  @Put()
  @ApiOperation({ summary: 'Заменить все записи об опыте работы сотрудника' })
  @ApiParam({ name: 'employeeId', type: Number })
  @ApiBody({ type: ReplaceWorkExperiencesDto })
  @ApiDataResponse(WorkExperienceResponseDto, { isArray: true })
  async replaceAll(
    @Param('employeeId', ParseIntPipe) employeeId: number,
    @Body() dto: ReplaceWorkExperiencesDto,
  ) {
    const result = await this.workExperiencesService.replaceAll(
      employeeId,
      dto.items,
    );

    return toApiResponse(result);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Обновить опыт работы сотрудника' })
  @ApiParam({ name: 'employeeId', type: Number })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateWorkExperienceDto })
  @ApiDataResponse(WorkExperienceResponseDto)
  async update(
    @Param('employeeId', ParseIntPipe) employeeId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateWorkExperienceDto,
  ) {
    const result = await this.workExperiencesService.update(id, dto, {
      employeeId,
    });

    return toApiResponse(result);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить опыт работы сотрудника' })
  @ApiParam({ name: 'employeeId', type: Number })
  @ApiParam({ name: 'id', type: Number })
  async delete(
    @Param('employeeId', ParseIntPipe) employeeId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const result = await this.workExperiencesService.delete(id, { employeeId });

    return toApiResponse(result);
  }
}
