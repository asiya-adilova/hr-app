import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { Prisma, type Employee } from '../../generated/prisma/client';
import { ErrorCode } from '../common/enums/error-code.enum';
import { ServiceResult } from '../common/response/service-result';
import { PagedResult } from '../common/response/paged-result';
import { EmployeeFilterDto } from './dto/employee-filter.dto';
import { EmployeeFilterSort } from './dto/enums/employee-filter-sort.enum';

@Injectable()
export class EmployeesService {
  constructor(private readonly prisma: PrismaService) {}

  async getById(id: number): Promise<ServiceResult<Employee>> {
    const employee = await this.prisma.employee.findFirst({
      where: { id, isDeleted: false },
    });

    if (!employee) {
      return ServiceResult.error(ErrorCode.NotFound, 'Сотрудник не найден');
    }

    return ServiceResult.success(employee);
  }

  async filter(
    filter: EmployeeFilterDto,
    pageSize: number,
    pageIndex: number,
  ): Promise<ServiceResult<PagedResult<Employee>>> {
    const skip = (pageIndex - 1) * pageSize;

    const where = this.buildEmployeeWhere(filter);
    const orderBy = this.buildEmployeeOrderBy(filter.sortBy);

    const [employees, totalCount] = await this.prisma.$transaction([
      this.prisma.employee.findMany({
        where,
        skip,
        take: pageSize,
        orderBy,
      }),

      this.prisma.employee.count({
        where,
      }),
    ]);

    const result = new PagedResult(employees, pageIndex, pageSize, totalCount);

    return ServiceResult.success(result);
  }

  async create(dto: CreateEmployeeDto): Promise<ServiceResult<Employee>> {
    const existingEmployees = await this.prisma.employee.findMany({
      where: {
        OR: [
          { pinfl: dto.pinfl },
          ...(dto.email ? [{ email: dto.email }] : []),
        ],
      },
    });

    if (existingEmployees.some((employee) => employee.pinfl === dto.pinfl)) {
      return ServiceResult.error(
        ErrorCode.DuplicateData,
        'Сотрудник с указанным ПИНФЛ уже существует',
      );
    }

    if (
      dto.email &&
      existingEmployees.some((employee) => employee.email === dto.email)
    ) {
      return ServiceResult.error(
        ErrorCode.DuplicateData,
        'Сотрудник с указанным email уже существует',
      );
    }

    const employee = await this.prisma.employee.create({
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        middleName: dto.middleName,

        birthDate: new Date(dto.birthDate),

        pinfl: dto.pinfl,

        passportSeries: dto.passportSeries,
        passportNumber: dto.passportNumber,
        passportIssueDate: new Date(dto.passportIssueDate),
        passportIssuedBy: dto.passportIssuedBy,

        phone: dto.phone,
        email: dto.email,
        address: dto.address,

        employeeNumber: dto.employeeNumber,
        hireDate: new Date(dto.hireDate),

        genderId: dto.genderId,
        citizenshipId: dto.citizenshipId,
        nationalityId: dto.nationalityId,
        departmentId: dto.departmentId,
        positionId: dto.positionId,
        employmentTypeId: dto.employmentTypeId,
        educationLevelId: dto.educationLevelId,
        maritalStatusId: dto.maritalStatusId,
        driverLicenseCategoryId: dto.driverLicenseCategoryId,

        totalExperienceMonths: dto.totalExperienceMonths,
        specialtyExperienceMonths: dto.specialtyExperienceMonths,

        militaryService: dto.militaryService,
        hasDriverLicense: dto.hasDriverLicense,

        additionalInfo: dto.additionalInfo,
      },
    });

    return ServiceResult.success(employee);
  }

  async update(
    id: number,
    dto: UpdateEmployeeDto,
  ): Promise<ServiceResult<Employee>> {
    const currentEmployee = await this.prisma.employee.findFirst({
      where: { id, isDeleted: false },
    });

    if (!currentEmployee) {
      return ServiceResult.error(ErrorCode.NotFound, 'Сотрудник не найден');
    }

    const uniquenessFilters = [
      ...(dto.pinfl ? [{ pinfl: dto.pinfl }] : []),
      ...(dto.email ? [{ email: dto.email }] : []),
    ];

    if (uniquenessFilters.length > 0) {
      const existingEmployees = await this.prisma.employee.findMany({
        where: {
          AND: [{ id: { not: id } }, { OR: uniquenessFilters }],
        },
      });

      if (
        dto.pinfl &&
        existingEmployees.some((employee) => employee.pinfl === dto.pinfl)
      ) {
        return ServiceResult.error(
          ErrorCode.DuplicateData,
          'Сотрудник с указанным ПИНФЛ уже существует',
        );
      }

      if (
        dto.email &&
        existingEmployees.some((employee) => employee.email === dto.email)
      ) {
        return ServiceResult.error(
          ErrorCode.DuplicateData,
          'Сотрудник с указанным email уже существует',
        );
      }
    }

    const employee = await this.prisma.employee.update({
      where: { id },
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        middleName: dto.middleName,

        birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,

        pinfl: dto.pinfl,

        passportSeries: dto.passportSeries,
        passportNumber: dto.passportNumber,
        passportIssueDate: dto.passportIssueDate
          ? new Date(dto.passportIssueDate)
          : undefined,
        passportIssuedBy: dto.passportIssuedBy,

        phone: dto.phone,
        email: dto.email,
        address: dto.address,

        employeeNumber: dto.employeeNumber,
        hireDate: dto.hireDate ? new Date(dto.hireDate) : undefined,

        genderId: dto.genderId,
        citizenshipId: dto.citizenshipId,
        nationalityId: dto.nationalityId,
        departmentId: dto.departmentId,
        positionId: dto.positionId,
        employmentTypeId: dto.employmentTypeId,
        educationLevelId: dto.educationLevelId,
        maritalStatusId: dto.maritalStatusId,
        driverLicenseCategoryId: dto.driverLicenseCategoryId,

        totalExperienceMonths: dto.totalExperienceMonths,
        specialtyExperienceMonths: dto.specialtyExperienceMonths,

        militaryService: dto.militaryService,
        hasDriverLicense: dto.hasDriverLicense,

        additionalInfo: dto.additionalInfo,
      },
    });

    return ServiceResult.success(employee);
  }

  private buildEmployeeWhere(
    filter: EmployeeFilterDto,
  ): Prisma.EmployeeWhereInput {
    const where: Prisma.EmployeeWhereInput = {
      isDeleted: false,
    };

    // Search
    if (filter.searchTerm?.trim()) {
      const searchTerm = filter.searchTerm.trim();

      where.OR = [
        {
          firstName: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
        {
          lastName: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
        {
          middleName: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
        {
          email: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
        {
          phone: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
        {
          employeeNumber: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
        {
          pinfl: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
        {
          passportNumber: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
        {
          address: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
      ];
    }

    // Employee IDs
    if (filter.employeeIds?.length) {
      where.id = {
        in: filter.employeeIds,
      };
    }

    // References
    if (filter.departmentIds?.length) {
      where.departmentId = {
        in: filter.departmentIds,
      };
    }

    if (filter.positionIds?.length) {
      where.positionId = {
        in: filter.positionIds,
      };
    }

    if (filter.citizenshipIds?.length) {
      where.citizenshipId = {
        in: filter.citizenshipIds,
      };
    }

    if (filter.nationalityIds?.length) {
      where.nationalityId = {
        in: filter.nationalityIds,
      };
    }

    if (filter.educationLevelIds?.length) {
      where.educationLevelId = {
        in: filter.educationLevelIds,
      };
    }

    if (filter.maritalStatusIds?.length) {
      where.maritalStatusId = {
        in: filter.maritalStatusIds,
      };
    }

    if (filter.employmentTypeIds?.length) {
      where.employmentTypeId = {
        in: filter.employmentTypeIds,
      };
    }

    // Experience
    if (
      filter.minExperienceMonths !== undefined ||
      filter.maxExperienceMonths !== undefined
    ) {
      where.totalExperienceMonths = {};

      if (filter.minExperienceMonths !== undefined) {
        where.totalExperienceMonths.gte = filter.minExperienceMonths;
      }

      if (filter.maxExperienceMonths !== undefined) {
        where.totalExperienceMonths.lte = filter.maxExperienceMonths;
      }
    }

    if (
      filter.minSpecialtyExperienceMonths !== undefined ||
      filter.maxSpecialtyExperienceMonths !== undefined
    ) {
      where.specialtyExperienceMonths = {};

      if (filter.minSpecialtyExperienceMonths !== undefined) {
        where.specialtyExperienceMonths.gte =
          filter.minSpecialtyExperienceMonths;
      }

      if (filter.maxSpecialtyExperienceMonths !== undefined) {
        where.specialtyExperienceMonths.lte =
          filter.maxSpecialtyExperienceMonths;
      }
    }

    // Birth date
    if (filter.birthDateFrom || filter.birthDateTo) {
      where.birthDate = {};

      if (filter.birthDateFrom) {
        where.birthDate.gte = new Date(filter.birthDateFrom);
      }

      if (filter.birthDateTo) {
        where.birthDate.lte = new Date(filter.birthDateTo);
      }
    }

    // Hire date
    if (filter.hireDateFrom || filter.hireDateTo) {
      where.hireDate = {};

      if (filter.hireDateFrom) {
        where.hireDate.gte = new Date(filter.hireDateFrom);
      }

      if (filter.hireDateTo) {
        where.hireDate.lte = new Date(filter.hireDateTo);
      }
    }

    // Boolean filters
    if (filter.hasDriverLicense !== undefined) {
      where.hasDriverLicense = filter.hasDriverLicense;
    }

    if (filter.militaryService !== undefined) {
      where.militaryService = filter.militaryService;
    }

    return where;
  }

  private buildEmployeeOrderBy(
    sortBy?: EmployeeFilterSort,
  ): Prisma.EmployeeOrderByWithRelationInput {
    switch (sortBy) {
      case EmployeeFilterSort.Oldest:
        return {
          createdAt: 'asc',
        };

      case EmployeeFilterSort.MostExperienced:
        return {
          totalExperienceMonths: 'desc',
        };

      case EmployeeFilterSort.LeastExperienced:
        return {
          totalExperienceMonths: 'asc',
        };

      case EmployeeFilterSort.LastUpdated:
        return {
          updatedAt: 'desc',
        };

      case EmployeeFilterSort.HireDate:
        return {
          hireDate: 'desc',
        };

      case EmployeeFilterSort.NameAsc:
        return {
          lastName: 'asc',
        };

      case EmployeeFilterSort.NameDesc:
        return {
          lastName: 'desc',
        };

      case EmployeeFilterSort.Newest:
      default:
        return {
          createdAt: 'desc',
        };
    }
  }
}
