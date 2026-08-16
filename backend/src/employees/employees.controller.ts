import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiBody,
  ApiExtraModels,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/request/create-employee-request.dto';
import { UpdateEmployeeDto } from './dto/request/update-employee-request.dto';
import { toApiResponse } from '../common/response/service-result-mapper';
import { PaginationDto } from '../common/request/pagination.dto';
import { EmployeeFilterDto } from './dto/request/employee-filter-request.dto';
import { EmployeeDetailsResponseDto } from './dto/response/employee-details-response.dto';
import { EmployeeTableResponseDto } from './dto/response/employee-table-response.dto';
import { ApiDataResponse } from '../common/swagger/api-data-response';
import { EducationResponseDto } from '../educations/dto/response/education-response.dto';
import { RelativeResponseDto } from '../relatives/dto/response/relative-response.dto';
import { WorkExperienceResponseDto } from '../work-experiences/dto/response/work-experience-response.dto';
import { Auth } from '../security/decorators/auth.decorator';
import { Roles } from '../security/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { CurrentUser } from '../security/decorators/current-user.decorator';
import type { AuthUser } from '../security/strategies/jwt.strategy';

@ApiTags('Employees')
@Auth()
@ApiExtraModels(
  EmployeeDetailsResponseDto,
  EmployeeTableResponseDto,
  EducationResponseDto,
  RelativeResponseDto,
  WorkExperienceResponseDto,
)
@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Get()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Список сотрудников' })
  @ApiDataResponse(EmployeeTableResponseDto, { paged: true })
  async getAll(@Query() pagination: PaginationDto) {
    const result = await this.employeesService.getAllPaged(
      pagination.pageSize,
      pagination.pageIndex,
    );

    return toApiResponse(result);
  }

  @Post('filter')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Фильтрация сотрудников' })
  @ApiBody({ type: EmployeeFilterDto })
  @ApiDataResponse(EmployeeTableResponseDto, { paged: true })
  async filter(
    @Body() filter: EmployeeFilterDto,
    @Query() pagination: PaginationDto,
  ) {
    const result = await this.employeesService.filter(
      filter,
      pagination.pageSize,
      pagination.pageIndex,
    );

    return toApiResponse(result);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить сотрудника по идентификатору' })
  @ApiParam({ name: 'id', type: Number })
  @ApiDataResponse(EmployeeDetailsResponseDto)
  async getById(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthUser,
  ) {
    const result = await this.employeesService.getById(id, {}, user);

    return toApiResponse(result);
  }

  @Post()
  @ApiOperation({ summary: 'Создать сотрудника' })
  @ApiBody({ type: CreateEmployeeDto })
  @ApiDataResponse(EmployeeDetailsResponseDto)
  async create(@Body() dto: CreateEmployeeDto, @CurrentUser() user: AuthUser) {
    const payload =
      user.role === Role.ADMIN ? dto : { ...dto, accountId: user.id };
    const result = await this.employeesService.create(payload);

    return toApiResponse(result);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Обновить сотрудника' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateEmployeeDto })
  @ApiDataResponse(EmployeeDetailsResponseDto)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEmployeeDto,
    @CurrentUser() user: AuthUser,
  ) {
    const result = await this.employeesService.update(id, dto, {}, user);

    return toApiResponse(result);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Удалить сотрудника' })
  @ApiParam({ name: 'id', type: Number })
  async delete(@Param('id', ParseIntPipe) id: number) {
    const result = await this.employeesService.delete(id);

    return toApiResponse(result);
  }
}
