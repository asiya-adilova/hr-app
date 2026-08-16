import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmployeeDto } from './dto/request/create-employee-request.dto';
import { UpdateEmployeeDto } from './dto/request/update-employee-request.dto';
import { Prisma } from '../../generated/prisma/client';
import { ErrorCode } from '../common/enums/error-code.enum';
import { ServiceResult } from '../common/response/service-result';
import { PagedResult } from '../common/response/paged-result';
import { EmployeeFilterDto } from './dto/request/employee-filter-request.dto';
import { EmployeeFilterSort } from './dto/enums/employee-filter-sort.enum';
import { EducationsService } from '../educations/educations.service';
import { RelativesService } from '../relatives/relatives.service';
import { WorkExperiencesService } from '../work-experiences/work-experiences.service';
import {
  EmployeeMapper,
  employeeLookupInclude,
  employeeTableInclude,
  type EmployeeWithLookups,
  type EmployeeWithTableReferences,
} from './mappings/employee-mapper';
import { EmployeeDetailsResponseDto } from './dto/response/employee-details-response.dto';
import { EmployeeTableResponseDto } from './dto/response/employee-table-response.dto';
import {
  BaseService,
  type SoftDeletable,
} from '../common/services/base.service';
import type { AuthUser } from '../auth/strategies/jwt.strategy';

@Injectable()
export class EmployeesService extends BaseService<
  SoftDeletable,
  EmployeeDetailsResponseDto,
  CreateEmployeeDto,
  UpdateEmployeeDto,
  EmployeeTableResponseDto
> {
  protected readonly notFoundMessage = 'Сотрудник не найден';

  constructor(
    prisma: PrismaService,
    private readonly educationsService: EducationsService,
    private readonly workExperiencesService: WorkExperiencesService,
    private readonly relativesService: RelativesService,
  ) {
    super(prisma);
  }

  protected getDelegate() {
    return this.prisma.employee;
  }

  protected getByIdInclude() {
    return employeeLookupInclude;
  }

  protected getListInclude() {
    return employeeTableInclude;
  }

  protected getDefaultOrderBy() {
    return { createdAt: 'desc' as const };
  }

  protected toResponse(model: SoftDeletable): EmployeeDetailsResponseDto {
    return EmployeeMapper.toDetailsResponse(
      model as unknown as EmployeeWithLookups,
      {
        education: [],
        workExperience: [],
        relatives: [],
      },
    );
  }

  protected toListResponse(model: SoftDeletable): EmployeeTableResponseDto {
    return EmployeeMapper.toTableResponse(
      model as unknown as EmployeeWithTableReferences,
    );
  }

  protected toCreateData(dto: CreateEmployeeDto) {
    return {
      accountId: dto.accountId,
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
    };
  }

  protected toUpdateData(dto: UpdateEmployeeDto) {
    return {
      accountId: dto.accountId,
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
    };
  }

  override async getById(
    id: number,
    where: Record<string, unknown> = {},
    user?: AuthUser,
  ): Promise<ServiceResult<EmployeeDetailsResponseDto>> {
    if (user) {
      const denied =
        this.forbiddenUnlessEmployeeOwner<EmployeeDetailsResponseDto>(id, user);
      if (denied) {
        return denied;
      }
    }

    const employee = await this.prisma.employee.findFirst({
      where: { id, ...where },
      include: employeeLookupInclude,
    });

    if (!employee) {
      return ServiceResult.error(ErrorCode.NotFound, this.notFoundMessage);
    }

    const [education, workExperience, relatives] = await Promise.all([
      this.educationsService.findByEmployeeId(id),
      this.workExperiencesService.findByEmployeeId(id),
      this.relativesService.findByEmployeeId(id),
    ]);

    return ServiceResult.success(
      EmployeeMapper.toDetailsResponse(employee, {
        education,
        workExperience,
        relatives,
      }),
    );
  }

  async filter(
    filter: EmployeeFilterDto,
    pageSize: number,
    pageIndex: number,
  ): Promise<ServiceResult<PagedResult<EmployeeTableResponseDto>>> {
    const skip = (pageIndex - 1) * pageSize;

    const where = this.buildEmployeeWhere(filter);
    const orderBy = this.buildEmployeeOrderBy(filter.sortBy);

    const [employees, totalCount] = await this.prisma.$transaction([
      this.prisma.employee.findMany({
        where,
        skip,
        take: pageSize,
        orderBy,
        include: employeeTableInclude,
      }),

      this.prisma.employee.count({
        where,
      }),
    ]);

    const result = new PagedResult(
      employees.map((employee) => EmployeeMapper.toTableResponse(employee)),
      pageIndex,
      pageSize,
      totalCount,
    );

    return ServiceResult.success(result);
  }

  override async create(
    dto: CreateEmployeeDto,
  ): Promise<ServiceResult<EmployeeDetailsResponseDto>> {
    const accountError = await this.findAccountError(dto.accountId);
    if (accountError) {
      return accountError;
    }

    const uniquenessError = await this.findUniquenessError({
      pinfl: dto.pinfl,
      email: dto.email,
      employeeNumber: dto.employeeNumber,
    });

    if (uniquenessError) {
      return uniquenessError;
    }

    return super.create(dto);
  }

  override async update(
    id: number,
    dto: UpdateEmployeeDto,
    where: Record<string, unknown> = {},
    user?: AuthUser,
  ): Promise<ServiceResult<EmployeeDetailsResponseDto>> {
    if (user) {
      const denied =
        this.forbiddenUnlessEmployeeOwner<EmployeeDetailsResponseDto>(id, user);
      if (denied) {
        return denied;
      }

      if (dto.accountId !== undefined && !this.isAdmin(user)) {
        return ServiceResult.error(
          ErrorCode.Forbidden,
          'Недостаточно прав для изменения аккаунта сотрудника',
        );
      }
    }

    const currentEmployee = await this.prisma.employee.findFirst({
      where: { id },
    });

    if (!currentEmployee) {
      return ServiceResult.error(ErrorCode.NotFound, this.notFoundMessage);
    }

    if (dto.accountId !== undefined) {
      const accountError = await this.findAccountError(
        dto.accountId,
        currentEmployee.id,
      );
      if (accountError) {
        return accountError;
      }
    }

    const uniquenessError = await this.findUniquenessError(
      {
        pinfl: dto.pinfl,
        email: dto.email,
        employeeNumber: dto.employeeNumber,
      },
      id,
    );

    if (uniquenessError) {
      return uniquenessError;
    }

    return super.update(id, dto, where);
  }

  private async findUniquenessError(
    fields: {
      pinfl?: string;
      email?: string;
      employeeNumber?: string;
    },
    excludeId?: number,
  ): Promise<ServiceResult<EmployeeDetailsResponseDto> | null> {
    const filters: Prisma.EmployeeWhereInput[] = [
      ...(fields.pinfl ? [{ pinfl: fields.pinfl }] : []),
      ...(fields.email ? [{ email: fields.email }] : []),
      ...(fields.employeeNumber
        ? [{ employeeNumber: fields.employeeNumber }]
        : []),
    ];

    if (filters.length === 0) {
      return null;
    }

    const existingEmployees = await this.prisma.employee.findMany({
      where: {
        ...(excludeId ? { id: { not: excludeId } } : {}),
        OR: filters,
      },
    });

    if (
      fields.pinfl &&
      existingEmployees.some((employee) => employee.pinfl === fields.pinfl)
    ) {
      return ServiceResult.error(
        ErrorCode.DuplicateData,
        'Сотрудник с указанным ПИНФЛ уже существует',
      );
    }

    if (
      fields.email &&
      existingEmployees.some((employee) => employee.email === fields.email)
    ) {
      return ServiceResult.error(
        ErrorCode.DuplicateData,
        'Сотрудник с указанным email уже существует',
      );
    }

    if (
      fields.employeeNumber &&
      existingEmployees.some(
        (employee) => employee.employeeNumber === fields.employeeNumber,
      )
    ) {
      return ServiceResult.error(
        ErrorCode.DuplicateData,
        'Сотрудник с указанным табельным номером уже существует',
      );
    }

    return null;
  }

  private async findAccountError(
    accountId: number,
    excludeEmployeeId?: number,
  ): Promise<ServiceResult<EmployeeDetailsResponseDto> | null> {
    const account = await this.prisma.account.findUnique({
      where: { id: accountId },
      include: { employee: true },
    });

    if (!account) {
      return ServiceResult.error(ErrorCode.NotFound, 'Аккаунт не найден');
    }

    if (account.role !== 'EMPLOYEE') {
      return ServiceResult.error(
        ErrorCode.BadRequest,
        'К сотруднику можно привязать только аккаунт с ролью EMPLOYEE',
      );
    }

    if (account.employee && account.employee.id !== excludeEmployeeId) {
      return ServiceResult.error(
        ErrorCode.DuplicateData,
        'Этот аккаунт уже привязан к сотруднику',
      );
    }

    return null;
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
          account: {
            firstName: {
              contains: searchTerm,
              mode: 'insensitive',
            },
          },
        },
        {
          account: {
            lastName: {
              contains: searchTerm,
              mode: 'insensitive',
            },
          },
        },
        {
          account: {
            middleName: {
              contains: searchTerm,
              mode: 'insensitive',
            },
          },
        },
        {
          account: {
            email: {
              contains: searchTerm,
              mode: 'insensitive',
            },
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
          account: {
            lastName: 'asc',
          },
        };

      case EmployeeFilterSort.NameDesc:
        return {
          account: {
            lastName: 'desc',
          },
        };

      case EmployeeFilterSort.Newest:
      default:
        return {
          createdAt: 'desc',
        };
    }
  }
}
