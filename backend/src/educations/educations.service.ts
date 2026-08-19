import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ErrorCode } from '../common/enums/error-code.enum';
import { ServiceResult } from '../common/response/service-result';
import { ErrorMessage } from '../common/messages/error-message';
import { BaseService } from '../common/services/base.service';
import { EmployeeMapper } from '../employees/mappings/employee-mapper';
import { EducationResponseDto } from './dto/response/education-response.dto';
import { CreateEducationDto } from './dto/request/create-education-request.dto';
import { UpdateEducationDto } from './dto/request/update-education-request.dto';
import type { Education } from '../../generated/prisma/client';
import { syncEmployeeExperience } from '../common/helpers/sync-employee-experience';
import { findCityCountryMismatch } from '../common/helpers/find-city-country-mismatch';
import {
  findGraduationYearBeforeBirthError,
  getEmployeeBirthDate,
} from '../common/helpers/find-birth-date-order-error';

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

  getAllByEmployeeId(
    employeeId: number,
  ): Promise<ServiceResult<EducationResponseDto[]>> {
    return this.withEmployeeAccess(employeeId, () =>
      super.getAll({ employeeId }),
    );
  }

  override async getById(
    id: number,
    where: Record<string, unknown> = {},
  ): Promise<ServiceResult<EducationResponseDto>> {
    const employeeId = where.employeeId as number;
    return this.withEmployeeAccess(employeeId, () => super.getById(id, where));
  }

  override async create(
    dto: CreateEducationDto,
    extra: Record<string, unknown> = {},
  ): Promise<ServiceResult<EducationResponseDto>> {
    const employeeId = extra.employeeId as number;
    return this.withEmployeeAccess(employeeId, async () => {
      const missing =
        await this.ensureEmployeeExists<EducationResponseDto>(employeeId);
      if (missing) {
        return missing;
      }

      const yearError =
        findGraduationYearBeforeBirthError<EducationResponseDto>(
          dto.graduationYear,
          await getEmployeeBirthDate(this.prisma, employeeId),
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
    });
  }

  override async update(
    id: number,
    dto: UpdateEducationDto,
    where: Record<string, unknown> = {},
  ): Promise<ServiceResult<EducationResponseDto>> {
    const employeeId = where.employeeId as number;
    return this.withEmployeeAccess(employeeId, async () => {
      const existing = await this.prisma.education.findFirst({
        where: { id, employeeId },
      });

      if (!existing) {
        return ServiceResult.error(
          ErrorCode.NotFound,
          ErrorMessage.educationNotFound,
        );
      }

      const yearError =
        findGraduationYearBeforeBirthError<EducationResponseDto>(
          dto.graduationYear ?? existing.graduationYear,
          await getEmployeeBirthDate(this.prisma, employeeId),
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
    });
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

      await syncEmployeeExperience(this.prisma, employeeId);

      return this.getAllByEmployeeId(employeeId);
    });
  }

  override async delete(
    id: number,
    where: Record<string, unknown> = {},
  ): Promise<ServiceResult<void>> {
    const employeeId = where.employeeId as number;
    return this.withEmployeeAccess(employeeId, async () => {
      const removed = await super.delete(id, where);
      if (removed.successful) {
        await syncEmployeeExperience(this.prisma, employeeId);
      }
      return removed;
    });
  }

  // #endregion

  // #region PROTECTED METHODS

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
    return EmployeeMapper.toEducationUpdateData(dto);
  }

  // #endregion

  // #region PRIVATE HELPERS

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
