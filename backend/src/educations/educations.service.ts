import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ErrorCode } from '../common/enums/error-code.enum';
import { ServiceResult } from '../common/response/service-result';
import { BaseService } from '../common/services/base.service';
import { ensureEmployeeExists } from '../common/helpers/ensure-employee-exists';
import { EmployeeMapper } from '../employees/mappings/employee-mapper';
import { EducationResponseDto } from './dto/response/education-response.dto';
import { CreateEducationDto } from './dto/request/create-education-request.dto';
import { UpdateEducationDto } from './dto/request/update-education-request.dto';
import type { Education } from '../../generated/prisma/client';
import { syncEmployeeExperience } from '../common/helpers/sync-employee-experience';
import { findCityCountryMismatch } from '../common/helpers/find-city-country-mismatch';
import { findGraduationYearBeforeBirthError } from '../common/helpers/find-birth-date-order-error';

@Injectable()
export class EducationsService extends BaseService<
  Education,
  EducationResponseDto,
  CreateEducationDto,
  UpdateEducationDto
> {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  // #region PUBLIC API (CONTROLLER ENDPOINTS)

  async findByEmployeeId(employeeId: number): Promise<EducationResponseDto[]> {
    const result = await this.getAll({ employeeId });
    return result.result ?? [];
  }

  listByEmployee(
    employeeId: number,
  ): Promise<ServiceResult<EducationResponseDto[]>> {
    return this.withEmployeeAccess(employeeId, () =>
      super.getAll({ employeeId }),
    );
  }

  getOne(
    employeeId: number,
    id: number,
  ): Promise<ServiceResult<EducationResponseDto>> {
    return this.withEmployeeAccess(employeeId, () =>
      super.getById(id, { employeeId }),
    );
  }

  add(
    employeeId: number,
    dto: CreateEducationDto,
  ): Promise<ServiceResult<EducationResponseDto>> {
    return this.withEmployeeAccess(employeeId, () =>
      this.create(dto, { employeeId }),
    );
  }

  override async create(
    dto: CreateEducationDto,
    extra: Record<string, unknown> = {},
  ): Promise<ServiceResult<EducationResponseDto>> {
    const employeeId = extra.employeeId as number;
    const employee = await ensureEmployeeExists(this.prisma, employeeId);
    if (!employee.successful) {
      return ServiceResult.error(
        employee.errorInfo?.code ?? ErrorCode.NotFound,
        employee.errorInfo?.message ?? 'Сотрудник не найден',
      );
    }

    const yearError = findGraduationYearBeforeBirthError<EducationResponseDto>(
      dto.graduationYear,
      await this.getEmployeeBirthDate(employeeId),
    );
    if (yearError) {
      return yearError;
    }

    const uniquenessError = await this.findUniquenessError(employeeId, {
      institution: dto.institutionName,
      specialty: dto.specialty,
      educationLevelId: dto.educationLevelId,
      graduationYear: dto.graduationYear,
    });

    if (uniquenessError) {
      return uniquenessError;
    }

    const locationError = await findCityCountryMismatch<EducationResponseDto>(
      this.prisma,
      dto.countryId,
      dto.cityId,
    );
    if (locationError) {
      return locationError;
    }

    const created = await super.create(dto, extra);
    if (created.successful) {
      await syncEmployeeExperience(this.prisma, employeeId);
    }
    return created;
  }

  override async update(
    id: number,
    dto: UpdateEducationDto,
    where: Record<string, unknown> = {},
  ): Promise<ServiceResult<EducationResponseDto>> {
    const employeeId = where.employeeId as number;
    const denied =
      await this.forbiddenUnlessEmployeeOwner<EducationResponseDto>(employeeId);
    if (denied) {
      return denied;
    }
    const existing = await this.prisma.education.findFirst({
      where: { id, employeeId },
    });

    if (!existing) {
      return ServiceResult.error(ErrorCode.NotFound, this.notFoundMessage);
    }

    const yearError = findGraduationYearBeforeBirthError<EducationResponseDto>(
      dto.graduationYear ?? existing.graduationYear,
      await this.getEmployeeBirthDate(employeeId),
    );
    if (yearError) {
      return yearError;
    }

    const uniquenessError = await this.findUniquenessError(
      employeeId,
      {
        institution: dto.institutionName ?? existing.institution,
        specialty: dto.specialty ?? existing.specialty,
        educationLevelId: dto.educationLevelId ?? existing.educationLevelId,
        graduationYear: dto.graduationYear ?? existing.graduationYear,
      },
      id,
    );

    if (uniquenessError) {
      return uniquenessError;
    }

    const locationError = await findCityCountryMismatch<EducationResponseDto>(
      this.prisma,
      dto.countryId ?? existing.countryId,
      dto.cityId ?? existing.cityId,
    );
    if (locationError) {
      return locationError;
    }

    const updated = await super.update(id, dto, where);
    if (updated.successful) {
      await syncEmployeeExperience(this.prisma, employeeId);
    }
    return updated;
  }

  async replaceAll(
    employeeId: number,
    items: CreateEducationDto[],
  ): Promise<ServiceResult<EducationResponseDto[]>> {
    return this.withEmployeeAccess(employeeId, async () => {
      await this.prisma.education.updateMany({
        where: { employeeId, isDeleted: false },
        data: { isDeleted: true, deletedAt: new Date() },
      });

      for (const item of items) {
        const created = await this.create(item, { employeeId });
        if (!created.successful) {
          return ServiceResult.error(
            created.errorInfo?.code ?? ErrorCode.BadRequest,
            created.errorInfo?.message ?? 'Не удалось сохранить образование',
          );
        }
      }

      const educations = await this.findByEmployeeId(employeeId);
      await syncEmployeeExperience(this.prisma, employeeId);
      return ServiceResult.success(educations);
    });
  }

  remove(employeeId: number, id: number): Promise<ServiceResult<void>> {
    return this.withEmployeeAccess(employeeId, async () => {
      const removed = await super.delete(id, { employeeId });
      if (removed.successful) {
        await syncEmployeeExperience(this.prisma, employeeId);
      }
      return removed;
    });
  }

  // #endregion

  // #region PROTECTED METHODS

  protected readonly notFoundMessage = 'Запись об образовании не найдена';

  protected getDelegate() {
    return this.prisma.education;
  }

  protected getByIdInclude() {
    return { educationLevel: true, country: true, city: true };
  }

  protected getDefaultOrderBy() {
    return { graduationYear: 'desc' as const };
  }

  protected toResponse(model: Education): EducationResponseDto {
    return EmployeeMapper.toEducationResponse(model);
  }

  protected toCreateData(dto: CreateEducationDto) {
    return EmployeeMapper.toEducationCreateData(dto);
  }

  protected toUpdateData(dto: UpdateEducationDto) {
    return {
      ...(dto.institutionName !== undefined && {
        institution: dto.institutionName,
      }),
      ...(dto.specialty !== undefined && { specialty: dto.specialty }),
      ...(dto.educationLevelId !== undefined && {
        educationLevelId: dto.educationLevelId,
      }),
      ...(dto.countryId !== undefined && { countryId: dto.countryId }),
      ...(dto.cityId !== undefined && { cityId: dto.cityId }),
      ...(dto.graduationYear !== undefined && {
        graduationYear: dto.graduationYear,
      }),
    };
  }

  // #endregion

  // #region PRIVATE HELPERS

  private async getEmployeeBirthDate(
    employeeId: number,
  ): Promise<Date | undefined> {
    const employee = await this.prisma.employee.findFirst({
      where: { id: employeeId },
      select: { birthDate: true },
    });
    return employee?.birthDate;
  }

  private async findUniquenessError(
    employeeId: number,
    fields: {
      institution: string;
      specialty: string;
      educationLevelId: number;
      graduationYear: number;
    },
    excludeId?: number,
  ): Promise<ServiceResult<EducationResponseDto> | null> {
    const duplicate = await this.prisma.education.findFirst({
      where: {
        employeeId,
        institution: fields.institution,
        specialty: fields.specialty,
        educationLevelId: fields.educationLevelId,
        graduationYear: fields.graduationYear,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
    });

    if (!duplicate) {
      return null;
    }

    return ServiceResult.error(
      ErrorCode.DuplicateData,
      'Запись об образовании с такими данными уже существует',
    );
  }

  // #endregion
}
