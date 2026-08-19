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
import { Auth } from '../security/decorators/auth.decorator';

@ApiTags('Relatives')
@Auth()
@Controller('employees/:employeeId/relatives')
export class RelativesController {
  constructor(private readonly relativesService: RelativesService) {}

  @Get()
  @ApiOperation({ summary: 'Список родственников сотрудника' })
  @ApiParam({ name: 'employeeId', type: Number })
  @ApiDataResponse(RelativeResponseDto, { isArray: true })
  async getAll(@Param('employeeId', ParseIntPipe) employeeId: number) {
    const result = await this.relativesService.getAllByEmployeeId(employeeId);

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
  ) {
    const result = await this.relativesService.getById(id, { employeeId });

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
  ) {
    const result = await this.relativesService.create(dto, { employeeId });

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
  ) {
    const result = await this.relativesService.update(id, dto, { employeeId });

    return toApiResponse(result);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить родственника сотрудника' })
  @ApiParam({ name: 'employeeId', type: Number })
  @ApiParam({ name: 'id', type: Number })
  async delete(
    @Param('employeeId', ParseIntPipe) employeeId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const result = await this.relativesService.delete(id, { employeeId });

    return toApiResponse(result);
  }
}
