import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';

import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { toApiResponse } from 'src/common/response/service-result-mapper';
import { PaginationDto } from 'src/common/request/pagination.dto';
import { EmployeeFilterDto } from './dto/employee-filter.dto';

@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Get(':id')
  async getById(@Param('id') id: string) {
    const result = await this.employeesService.getById(Number(id));

    return toApiResponse(result);
  }

  @Post('filter')
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

  @Post()
  async create(@Body() dto: CreateEmployeeDto) {
    const result = await this.employeesService.create(dto);

    return toApiResponse(result);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateEmployeeDto) {
    const result = await this.employeesService.update(Number(id), dto);

    return toApiResponse(result);
  }
}
