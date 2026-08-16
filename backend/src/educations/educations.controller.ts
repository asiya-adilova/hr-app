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
import { EducationsService } from './educations.service';
import { CreateEducationDto } from './dto/request/create-education-request.dto';
import { UpdateEducationDto } from './dto/request/update-education-request.dto';
import { EducationResponseDto } from './dto/response/education-response.dto';
import { toApiResponse } from '../common/response/service-result-mapper';
import { ApiDataResponse } from '../common/swagger/api-data-response';
import { Auth } from '../security/decorators/auth.decorator';
import { CurrentUser } from '../security/decorators/current-user.decorator';
import type { AuthUser } from '../security/strategies/jwt.strategy';

@ApiTags('Educations')
@Auth()
@Controller('employees/:employeeId/educations')
export class EducationsController {
  constructor(private readonly educationsService: EducationsService) {}

  @Get()
  @ApiOperation({ summary: 'Список образований сотрудника' })
  @ApiParam({ name: 'employeeId', type: Number })
  @ApiDataResponse(EducationResponseDto, { isArray: true })
  async getAll(
    @Param('employeeId', ParseIntPipe) employeeId: number,
    @CurrentUser() user: AuthUser,
  ) {
    const result = await this.educationsService.listByEmployee(
      employeeId,
      user,
    );

    return toApiResponse(result);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить образование по идентификатору' })
  @ApiParam({ name: 'employeeId', type: Number })
  @ApiParam({ name: 'id', type: Number })
  @ApiDataResponse(EducationResponseDto)
  async getById(
    @Param('employeeId', ParseIntPipe) employeeId: number,
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthUser,
  ) {
    const result = await this.educationsService.getOne(employeeId, id, user);

    return toApiResponse(result);
  }

  @Post()
  @ApiOperation({ summary: 'Добавить образование сотрудника' })
  @ApiParam({ name: 'employeeId', type: Number })
  @ApiBody({ type: CreateEducationDto })
  @ApiDataResponse(EducationResponseDto)
  async create(
    @Param('employeeId', ParseIntPipe) employeeId: number,
    @Body() dto: CreateEducationDto,
    @CurrentUser() user: AuthUser,
  ) {
    const result = await this.educationsService.add(employeeId, dto, user);

    return toApiResponse(result);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Обновить образование сотрудника' })
  @ApiParam({ name: 'employeeId', type: Number })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateEducationDto })
  @ApiDataResponse(EducationResponseDto)
  async update(
    @Param('employeeId', ParseIntPipe) employeeId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEducationDto,
    @CurrentUser() user: AuthUser,
  ) {
    const result = await this.educationsService.update(
      id,
      dto,
      { employeeId },
      user,
    );

    return toApiResponse(result);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить образование сотрудника' })
  @ApiParam({ name: 'employeeId', type: Number })
  @ApiParam({ name: 'id', type: Number })
  async delete(
    @Param('employeeId', ParseIntPipe) employeeId: number,
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthUser,
  ) {
    const result = await this.educationsService.remove(employeeId, id, user);

    return toApiResponse(result);
  }
}
