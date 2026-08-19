import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ErrorCode } from '../common/enums/error-code.enum';
import { ServiceResult } from '../common/response/service-result';
import { ErrorMessage } from '../common/messages/error-message';
import { BaseService } from '../common/services/base.service';
import { EmployeeMapper } from '../employees/mappings/employee-mapper';
import { WorkExperienceResponseDto } from './dto/response/work-experience-response.dto';
import { CreateWorkExperienceDto } from './dto/request/create-work-experience-request.dto';
import { UpdateWorkExperienceDto } from './dto/request/update-work-experience-request.dto';
import type { WorkExperience } from '../../generated/prisma/client';
import { syncEmployeeExperience } from '../common/helpers/sync-employee-experience';
import { findCityCountryMismatch } from '../common/helpers/find-city-country-mismatch';
import {
  findExperienceDatesBeforeBirthError,
  getEmployeeBirthDate,
} from '../common/helpers/find-birth-date-order-error';
import {
  localTodayIsoDate,
  toIsoDateKey,
} from '../common/validators/date.validators';

@Injectable()
export class WorkExperiencesService extends BaseService<
  WorkExperience,
  WorkExperienceResponseDto,
  CreateWorkExperienceDto,
  UpdateWorkExperienceDto
> {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  // #region PUBLIC API (CONTROLLER ENDPOINTS)

  getAllByEmployeeId(
    employeeId: number,
  ): Promise<ServiceResult<WorkExperienceResponseDto[]>> {
    return this.withEmployeeAccess(employeeId, () =>
      super.getAll({ employeeId }),
    );
  }

  override async getById(
    id: number,
    where: Record<string, unknown> = {},
  ): Promise<ServiceResult<WorkExperienceResponseDto>> {
    const employeeId = where.employeeId as number;
    return this.withEmployeeAccess(employeeId, () => super.getById(id, where));
  }

  override async create(
    dto: CreateWorkExperienceDto,
    extra: Record<string, unknown> = {},
  ): Promise<ServiceResult<WorkExperienceResponseDto>> {
    const employeeId = extra.employeeId as number;
    return this.withEmployeeAccess(employeeId, async () => {
      const missing =
        await this.ensureEmployeeExists<WorkExperienceResponseDto>(employeeId);
      if (missing) {
        return missing;
      }

      const dateOrderError =
        findExperienceDatesBeforeBirthError<WorkExperienceResponseDto>({
          birthDate: await getEmployeeBirthDate(this.prisma, employeeId),
          startDate: dto.startDate,
          endDate: dto.isCurrent ? undefined : dto.endDate,
        });
      if (dateOrderError) {
        return dateOrderError;
      }

      const uniquenessError = await this.findUniquenessError(employeeId, {
        companyName: dto.companyName,
        positionId: dto.positionId,
        startDate: new Date(dto.startDate),
        endDate: dto.isCurrent || !dto.endDate ? null : new Date(dto.endDate),
      });

      if (uniquenessError) {
        return uniquenessError;
      }

      const locationError =
        await findCityCountryMismatch<WorkExperienceResponseDto>(
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
    dto: UpdateWorkExperienceDto,
    where: Record<string, unknown> = {},
  ): Promise<ServiceResult<WorkExperienceResponseDto>> {
    const employeeId = where.employeeId as number;
    return this.withEmployeeAccess(employeeId, async () => {
      const existing = await this.prisma.workExperience.findFirst({
        where: { id, employeeId },
      });

      if (!existing) {
        return ServiceResult.error(
          ErrorCode.NotFound,
          ErrorMessage.workExperienceNotFound,
        );
      }

      const isCurrent = dto.isCurrent ?? existing.endDate == null;
      const dateOrderError =
        findExperienceDatesBeforeBirthError<WorkExperienceResponseDto>({
          birthDate: await getEmployeeBirthDate(this.prisma, employeeId),
          startDate: dto.startDate ?? existing.startDate,
          endDate: isCurrent ? undefined : (dto.endDate ?? existing.endDate),
        });
      if (dateOrderError) {
        return dateOrderError;
      }

      const uniquenessError = await this.findUniquenessError(
        employeeId,
        {
          companyName: dto.companyName ?? existing.companyName,
          positionId: dto.positionId ?? existing.positionId,
          startDate: dto.startDate
            ? new Date(dto.startDate)
            : existing.startDate,
          endDate: dto.isCurrent
            ? null
            : dto.endDate
              ? new Date(dto.endDate)
              : existing.endDate,
        },
        id,
      );

      if (uniquenessError) {
        return uniquenessError;
      }

      const locationError =
        await findCityCountryMismatch<WorkExperienceResponseDto>(
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
    items: CreateWorkExperienceDto[],
  ): Promise<ServiceResult<WorkExperienceResponseDto[]>> {
    return this.withEmployeeAccess(employeeId, async () => {
      if (this.hasOverlappingWorkExperiences(items)) {
        return ServiceResult.error(
          ErrorCode.DuplicateData,
          ErrorMessage.duplicateWorkExperience,
        );
      }

      await this.prisma.workExperience.updateMany({
        where: { employeeId, isDeleted: false },
        data: { isDeleted: true, deletedAt: new Date() },
      });

      for (const item of items) {
        const created = await this.create(item, { employeeId });
        if (!created.successful) {
          return ServiceResult.error(
            created.errorInfo?.code ?? ErrorCode.BadRequest,
            created.errorInfo?.message ?? 'Не удалось сохранить опыт работы',
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
    return this.prisma.workExperience;
  }

  protected getByIdInclude() {
    return { position: true, country: true, city: true };
  }

  protected getDefaultOrderBy() {
    return { startDate: 'desc' as const };
  }

  protected toResponse(model: WorkExperience): WorkExperienceResponseDto {
    return EmployeeMapper.toWorkExperienceResponse(model);
  }

  protected toCreateData(dto: CreateWorkExperienceDto) {
    return EmployeeMapper.toWorkExperienceCreateData(dto);
  }

  protected toUpdateData(dto: UpdateWorkExperienceDto) {
    return EmployeeMapper.toWorkExperienceUpdateData(dto);
  }

  // #endregion

  // #region PRIVATE HELPERS

  private async findUniquenessError(
    employeeId: number,
    fields: {
      companyName: string;
      positionId: number;
      startDate: Date;
      endDate: Date | null;
    },
    excludeId?: number,
  ): Promise<ServiceResult<WorkExperienceResponseDto> | null> {
    const candidates = await this.prisma.workExperience.findMany({
      where: {
        employeeId,
        companyName: {
          equals: fields.companyName.trim(),
          mode: 'insensitive',
        },
        positionId: fields.positionId,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
    });

    const startKey = toIsoDateKey(fields.startDate);
    const endKey = toIsoDateKey(fields.endDate) || localTodayIsoDate();
    const duplicate = candidates.find((item) =>
      this.periodsOverlap(
        { startDate: startKey, endDate: endKey },
        {
          startDate: toIsoDateKey(item.startDate),
          endDate: toIsoDateKey(item.endDate) || localTodayIsoDate(),
        },
      ),
    );

    if (!duplicate) {
      return null;
    }

    return ServiceResult.error(
      ErrorCode.DuplicateData,
      ErrorMessage.duplicateWorkExperience,
    );
  }

  private experienceRange(item: {
    startDate: string | Date;
    endDate?: string | Date | null;
    isCurrent?: boolean;
  }) {
    return {
      startDate: toIsoDateKey(item.startDate),
      endDate:
        item.isCurrent || !item.endDate
          ? localTodayIsoDate()
          : toIsoDateKey(item.endDate),
    };
  }

  private periodsOverlap(
    first: { startDate: string; endDate: string },
    second: { startDate: string; endDate: string },
  ) {
    return (
      first.startDate <= second.endDate && second.startDate <= first.endDate
    );
  }

  private isSameWorkExperienceRole(
    first: { companyName: string; positionId: number },
    second: { companyName: string; positionId: number },
  ) {
    return (
      first.companyName.trim().toLowerCase() ===
        second.companyName.trim().toLowerCase() &&
      first.positionId === second.positionId
    );
  }

  private hasOverlappingWorkExperiences(items: CreateWorkExperienceDto[]) {
    for (let first = 0; first < items.length; first += 1) {
      for (let second = first + 1; second < items.length; second += 1) {
        if (
          this.isSameWorkExperienceRole(items[first], items[second]) &&
          this.periodsOverlap(
            this.experienceRange(items[first]),
            this.experienceRange(items[second]),
          )
        ) {
          return true;
        }
      }
    }

    return false;
  }

  // #endregion
}
