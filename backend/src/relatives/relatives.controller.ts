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
import { RelativesService } from './relatives.service';
import { CreateRelativeDto } from './dto/request/create-relative-request.dto';
import { UpdateRelativeDto } from './dto/request/update-relative-request.dto';
import { RelativeResponseDto } from './dto/response/relative-response.dto';
import { toApiResponse } from '../common/response/service-result-mapper';
import { ApiDataResponse } from '../common/swagger/api-data-response';
import { Auth } from '../auth/decorators/auth.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthUser } from '../auth/strategies/jwt.strategy';

@ApiTags('Relatives')
@Auth()
@Controller('employees/:employeeId/relatives')
export class RelativesController {
  constructor(private readonly relativesService: RelativesService) {}

  @Get()
  @ApiOperation({ summary: 'Список родственников сотрудника' })
  @ApiParam({ name: 'employeeId', type: Number })
  @ApiDataResponse(RelativeResponseDto, { isArray: true })
  async getAll(
    @Param('employeeId', ParseIntPipe) employeeId: number,
    @CurrentUser() user: AuthUser,
  ) {
    const result = await this.relativesService.listByEmployee(employeeId, user);

    return toApiResponse(result);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить родственника по идентификатору' })
  @ApiParam({ name: 'employeeId', type: Number })
  @ApiParam({ name: 'id', type: Number })
  @ApiDataResponse(RelativeResponseDto)
  async getById(
    @Param('employeeId', ParseIntPipe) employeeId: number,
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthUser,
  ) {
    const result = await this.relativesService.getOne(employeeId, id, user);

    return toApiResponse(result);
  }

  @Post()
  @ApiOperation({ summary: 'Добавить родственника сотрудника' })
  @ApiParam({ name: 'employeeId', type: Number })
  @ApiBody({ type: CreateRelativeDto })
  @ApiDataResponse(RelativeResponseDto)
  async create(
    @Param('employeeId', ParseIntPipe) employeeId: number,
    @Body() dto: CreateRelativeDto,
    @CurrentUser() user: AuthUser,
  ) {
    const result = await this.relativesService.add(employeeId, dto, user);

    return toApiResponse(result);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Обновить родственника сотрудника' })
  @ApiParam({ name: 'employeeId', type: Number })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateRelativeDto })
  @ApiDataResponse(RelativeResponseDto)
  async update(
    @Param('employeeId', ParseIntPipe) employeeId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRelativeDto,
    @CurrentUser() user: AuthUser,
  ) {
    const result = await this.relativesService.update(
      id,
      dto,
      { employeeId },
      user,
    );

    return toApiResponse(result);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить родственника сотрудника' })
  @ApiParam({ name: 'employeeId', type: Number })
  @ApiParam({ name: 'id', type: Number })
  async delete(
    @Param('employeeId', ParseIntPipe) employeeId: number,
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthUser,
  ) {
    const result = await this.relativesService.remove(employeeId, id, user);

    return toApiResponse(result);
  }
}
