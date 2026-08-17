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
      ...(dto.position !== undefined && { position: dto.position }),
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
      position: dto.position,
      startDate: new Date(dto.startDate),
    });

    if (uniquenessError) {
      return uniquenessError;
    }

    return super.create(dto, extra);
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
        position: dto.position ?? existing.position,
        startDate: dto.startDate ? new Date(dto.startDate) : existing.startDate,
      },
      id,
    );

    if (uniquenessError) {
      return uniquenessError;
    }

    return super.update(id, dto, where);
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
      return ServiceResult.success(experiences);
    });
  }

  async remove(
    employeeId: number,
    id: number,
    user: AuthUser,
  ): Promise<ServiceResult<void>> {
    return this.withEmployeeAccess(employeeId, user, () =>
      super.delete(id, { employeeId }),
    );
  }

  private async findUniquenessError(
    employeeId: number,
    fields: {
      companyName: string;
      position: string;
      startDate: Date;
    },
    excludeId?: number,
  ): Promise<ServiceResult<WorkExperienceResponseDto> | null> {
    const duplicate = await this.prisma.workExperience.findFirst({
      where: {
        employeeId,
        companyName: fields.companyName,
        position: fields.position,
        startDate: fields.startDate,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
    });

    if (!duplicate) {
      return null;
    }

    return ServiceResult.error(
      ErrorCode.DuplicateData,
      'Запись об опыте работы с такими данными уже существует',
    );
  }
}
