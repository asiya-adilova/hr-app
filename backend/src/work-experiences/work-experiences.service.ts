import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ErrorCode } from '../common/enums/error-code.enum';
import { ServiceResult } from '../common/response/service-result';
import { BaseService } from '../common/services/base.service';
import { ensureEmployeeExists } from '../common/helpers/ensure-employee-exists';
import { EmployeeMapper } from '../employees/mappings/employee-mapper';
import { WorkExperienceResponseDto } from './dto/response/work-experience-response.dto';
import { CreateWorkExperienceDto } from './dto/request/create-work-experience-request.dto';
import { UpdateWorkExperienceDto } from './dto/request/update-work-experience-request.dto';
import type { WorkExperience } from '../../generated/prisma/client';
import type { AuthUser } from '../security/strategies/jwt.strategy';
import { syncEmployeeExperience } from '../common/helpers/sync-employee-experience';
import { findCityCountryMismatch } from '../common/helpers/find-city-country-mismatch';

@Injectable()
export class WorkExperiencesService extends BaseService<
  WorkExperience,
  WorkExperienceResponseDto,
  CreateWorkExperienceDto,
  UpdateWorkExperienceDto
> {
  protected readonly notFoundMessage = 'Запись об опыте работы не найдена';

  constructor(prisma: PrismaService) {
    super(prisma);
  }

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
    return {
      ...(dto.companyName !== undefined && { companyName: dto.companyName }),
      ...(dto.positionId !== undefined && { positionId: dto.positionId }),
      ...(dto.countryId !== undefined && { countryId: dto.countryId }),
      ...(dto.cityId !== undefined && { cityId: dto.cityId }),
      ...(dto.startDate !== undefined && {
        startDate: new Date(dto.startDate),
      }),
      ...(dto.isCurrent !== undefined || dto.endDate !== undefined
        ? {
            endDate: dto.isCurrent
              ? null
              : dto.endDate
                ? new Date(dto.endDate)
                : null,
          }
        : {}),
      ...(dto.responsibilities !== undefined && {
        responsibilities: dto.responsibilities,
      }),
    };
  }

  async findByEmployeeId(
    employeeId: number,
  ): Promise<WorkExperienceResponseDto[]> {
    const result = await this.getAll({ employeeId });
    return result.result ?? [];
  }

  async listByEmployee(
    employeeId: number,
    user: AuthUser,
  ): Promise<ServiceResult<WorkExperienceResponseDto[]>> {
    return this.withEmployeeAccess(employeeId, user, () =>
      super.getAll({ employeeId }),
    );
  }

  async getOne(
    employeeId: number,
    id: number,
    user: AuthUser,
  ): Promise<ServiceResult<WorkExperienceResponseDto>> {
    return this.withEmployeeAccess(employeeId, user, () =>
      super.getById(id, { employeeId }),
    );
  }

  override async create(
    dto: CreateWorkExperienceDto,
    extra: Record<string, unknown> = {},
  ): Promise<ServiceResult<WorkExperienceResponseDto>> {
    const employeeId = extra.employeeId as number;
    const employee = await ensureEmployeeExists(this.prisma, employeeId);
    if (!employee.successful) {
      return ServiceResult.error(
        employee.errorInfo?.code ?? ErrorCode.NotFound,
        employee.errorInfo?.message ?? 'Сотрудник не найден',
      );
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
  }

  override async update(
    id: number,
    dto: UpdateWorkExperienceDto,
    where: Record<string, unknown> = {},
    user?: AuthUser,
  ): Promise<ServiceResult<WorkExperienceResponseDto>> {
    const employeeId = where.employeeId as number;
    if (user) {
      const denied =
        this.forbiddenUnlessEmployeeOwner<WorkExperienceResponseDto>(
          employeeId,
          user,
        );
      if (denied) {
        return denied;
      }
    }
    const existing = await this.prisma.workExperience.findFirst({
      where: { id, employeeId },
    });

    if (!existing) {
      return ServiceResult.error(ErrorCode.NotFound, this.notFoundMessage);
    }

    const uniquenessError = await this.findUniquenessError(
      employeeId,
      {
        companyName: dto.companyName ?? existing.companyName,
        positionId: dto.positionId ?? existing.positionId,
        startDate: dto.startDate ? new Date(dto.startDate) : existing.startDate,
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
  }

  async add(
    employeeId: number,
    dto: CreateWorkExperienceDto,
    user: AuthUser,
  ): Promise<ServiceResult<WorkExperienceResponseDto>> {
    return this.withEmployeeAccess(employeeId, user, () =>
      this.create(dto, { employeeId }),
    );
  }

  async replaceAll(
    employeeId: number,
    items: CreateWorkExperienceDto[],
    user: AuthUser,
  ): Promise<ServiceResult<WorkExperienceResponseDto[]>> {
    return this.withEmployeeAccess(employeeId, user, async () => {
      if (hasOverlappingWorkExperiences(items)) {
        return ServiceResult.error(
          ErrorCode.DuplicateData,
          DUPLICATE_WORK_EXPERIENCE_MESSAGE,
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

      const experiences = await this.findByEmployeeId(employeeId);
      await syncEmployeeExperience(this.prisma, employeeId);
      return ServiceResult.success(experiences);
    });
  }

  async remove(
    employeeId: number,
    id: number,
    user: AuthUser,
  ): Promise<ServiceResult<void>> {
    return this.withEmployeeAccess(employeeId, user, async () => {
      const removed = await super.delete(id, { employeeId });
      if (removed.successful) {
        await syncEmployeeExperience(this.prisma, employeeId);
      }
      return removed;
    });
  }

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
      periodsOverlap(
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
      DUPLICATE_WORK_EXPERIENCE_MESSAGE,
    );
  }
}

const DUPLICATE_WORK_EXPERIENCE_MESSAGE =
  'Нельзя указать один и тот же опыт работы несколько раз';

function localTodayIsoDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function toIsoDateKey(value: string | Date | null | undefined) {
  if (!value) {
    return '';
  }
  if (typeof value === 'string') {
    return value.slice(0, 10);
  }
  return value.toISOString().slice(0, 10);
}

function experienceRange(item: {
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

function periodsOverlap(
  first: { startDate: string; endDate: string },
  second: { startDate: string; endDate: string },
) {
  return first.startDate <= second.endDate && second.startDate <= first.endDate;
}

function isSameWorkExperienceRole(
  first: { companyName: string; positionId: number },
  second: { companyName: string; positionId: number },
) {
  return (
    first.companyName.trim().toLowerCase() ===
      second.companyName.trim().toLowerCase() &&
    first.positionId === second.positionId
  );
}

function hasOverlappingWorkExperiences(items: CreateWorkExperienceDto[]) {
  for (let first = 0; first < items.length; first += 1) {
    for (let second = first + 1; second < items.length; second += 1) {
      if (
        isSameWorkExperienceRole(items[first], items[second]) &&
        periodsOverlap(experienceRange(items[first]), experienceRange(items[second]))
      ) {
        return true;
      }
    }
  }

  return false;
}
