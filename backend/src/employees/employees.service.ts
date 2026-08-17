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
import type { AuthUser } from '../security/strategies/jwt.strategy';
import { syncEmployeeExperience } from '../common/helpers/sync-employee-experience';
import { findCityCountryMismatch } from '../common/helpers/find-city-country-mismatch';

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
      passportExpireDate: new Date(dto.passportExpireDate),
      passportIssuedBy: dto.passportIssuedBy,
      phone: dto.phone,
      address: dto.address,
      countryId: dto.countryId,
      cityId: dto.cityId,
      employeeNumber: dto.employeeNumber ?? `EMP-${dto.accountId}`,
      hireDate: dto.hireDate ? new Date(dto.hireDate) : undefined,
      formStep: dto.formStep ?? 1,
      genderId: dto.genderId,
      citizenshipId: dto.citizenshipId,
      nationalityId: dto.nationalityId,
      departmentId: dto.departmentId,
      positionId: dto.positionId,
      employmentTypeId: dto.employmentTypeId,
      maritalStatusId: dto.maritalStatusId,
      driverLicenseCategoryId:
        dto.hasDriverLicense === false ? null : dto.driverLicenseCategoryId,
      totalExperienceMonths: 0,
      specialtyExperienceMonths: 0,
      militaryService: dto.militaryService ?? false,
      hasDriverLicense: dto.hasDriverLicense ?? false,
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
      passportExpireDate: dto.passportExpireDate
        ? new Date(dto.passportExpireDate)
        : undefined,
      passportIssuedBy: dto.passportIssuedBy,
      phone: dto.phone,
      address: dto.address,
      countryId: dto.countryId,
      cityId: dto.cityId,
      employeeNumber: dto.employeeNumber,
      hireDate: dto.hireDate ? new Date(dto.hireDate) : undefined,
      formStep: dto.formStep,
      genderId: dto.genderId,
      citizenshipId: dto.citizenshipId,
      nationalityId: dto.nationalityId,
      departmentId: dto.departmentId,
      positionId: dto.positionId,
      employmentTypeId: dto.employmentTypeId,
      maritalStatusId: dto.maritalStatusId,
      driverLicenseCategoryId:
        dto.hasDriverLicense === false ? null : dto.driverLicenseCategoryId,
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
      employeeNumber: dto.employeeNumber ?? `EMP-${dto.accountId}`,
    });

    if (uniquenessError) {
      return uniquenessError;
    }

    const locationError =
      await findCityCountryMismatch<EmployeeDetailsResponseDto>(
        this.prisma,
        dto.countryId,
        dto.cityId,
      );
    if (locationError) {
      return locationError;
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
        employeeNumber: dto.employeeNumber,
      },
      id,
    );

    if (uniquenessError) {
      return uniquenessError;
    }

    const locationError =
      await findCityCountryMismatch<EmployeeDetailsResponseDto>(
        this.prisma,
        dto.countryId ?? currentEmployee.countryId,
        dto.cityId ?? currentEmployee.cityId,
      );
    if (locationError) {
      return locationError;
    }

    const updated = await super.update(
      id,
      {
        ...dto,
        formStep: Math.max(
          currentEmployee.formStep,
          dto.formStep ?? currentEmployee.formStep,
        ),
      },
      where,
    );

    if (!updated.successful) {
      return updated;
    }

    await syncEmployeeExperience(this.prisma, id);
    return this.getById(id, where, user);
  }

  private async findUniquenessError(
    fields: {
      pinfl?: string;
      employeeNumber?: string;
    },
    excludeId?: number,
  ): Promise<ServiceResult<EmployeeDetailsResponseDto> | null> {
    const filters: Prisma.EmployeeWhereInput[] = [
      ...(fields.pinfl ? [{ pinfl: fields.pinfl }] : []),
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
      include: {
        employee: {
          select: { id: true },
        },
      },
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
      const tokens = filter.searchTerm.trim().split(/\s+/).filter(Boolean);

      where.AND = tokens.map((token) => this.matchSearchToken(token));
    }

    // References
    if (filter.countryIds?.length) {
      where.countryId = {
        in: filter.countryIds,
      };
    }

    if (filter.cityIds?.length) {
      where.cityId = {
        in: filter.cityIds,
      };
    }

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
      where.educations = {
        some: {
          isDeleted: false,
          educationLevelId: {
            in: filter.educationLevelIds,
          },
        },
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

  private containsInsensitive(value: string): Prisma.StringFilter {
    return {
      contains: value,
      mode: 'insensitive',
    };
  }

  private matchSearchToken(token: string): Prisma.EmployeeWhereInput {
    const contains = this.containsInsensitive(token);
    const compact = token.replace(/[\s\-()]/g, '');
    const compactContains =
      compact && compact !== token ? this.containsInsensitive(compact) : null;

    const or: Prisma.EmployeeWhereInput[] = [
      { account: { firstName: contains } },
      { account: { lastName: contains } },
      { account: { middleName: contains } },
      { account: { email: contains } },
      { phone: contains },
      { pinfl: contains },
      { passportSeries: contains },
      { passportNumber: contains },
      { employeeNumber: contains },
    ];

    if (compactContains) {
      or.push(
        { phone: compactContains },
        { pinfl: compactContains },
        { passportSeries: compactContains },
        { passportNumber: compactContains },
        { employeeNumber: compactContains },
      );
    }

    const passportParts = compact.match(/^([A-Za-zА-Яа-яЁё]+)(\d+)$/);
    if (passportParts) {
      or.push({
        AND: [
          { passportSeries: this.containsInsensitive(passportParts[1]) },
          { passportNumber: this.containsInsensitive(passportParts[2]) },
        ],
      });
    }

    return { OR: or };
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
          specialtyExperienceMonths: 'desc',
        };

      case EmployeeFilterSort.LeastExperienced:
        return {
          specialtyExperienceMonths: 'asc',
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
