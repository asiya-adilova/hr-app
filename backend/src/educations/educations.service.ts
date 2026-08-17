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
import type { AuthUser } from '../security/strategies/jwt.strategy';
import { syncEmployeeExperience } from '../common/helpers/sync-employee-experience';

@Injectable()
export class EducationsService extends BaseService<
  Education,
  EducationResponseDto,
  CreateEducationDto,
  UpdateEducationDto
> {
  protected readonly notFoundMessage = 'Запись об образовании не найдена';

  constructor(prisma: PrismaService) {
    super(prisma);
  }

  protected getDelegate() {
    return this.prisma.education;
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
      ...(dto.graduationYear !== undefined && {
        graduationYear: dto.graduationYear,
      }),
    };
  }

  async findByEmployeeId(employeeId: number): Promise<EducationResponseDto[]> {
    const result = await this.getAll({ employeeId });
    return result.result ?? [];
  }

  listByEmployee(
    employeeId: number,
    user: AuthUser,
  ): Promise<ServiceResult<EducationResponseDto[]>> {
    return this.withEmployeeAccess(employeeId, user, () =>
      super.getAll({ employeeId }),
    );
  }

  getOne(
    employeeId: number,
    id: number,
    user: AuthUser,
  ): Promise<ServiceResult<EducationResponseDto>> {
    return this.withEmployeeAccess(employeeId, user, () =>
      super.getById(id, { employeeId }),
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

    const uniquenessError = await this.findUniquenessError(employeeId, {
      institution: dto.institutionName,
      specialty: dto.specialty,
      graduationYear: dto.graduationYear,
    });

    if (uniquenessError) {
      return uniquenessError;
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
    user?: AuthUser,
  ): Promise<ServiceResult<EducationResponseDto>> {
    const employeeId = where.employeeId as number;
    if (user) {
      const denied = this.forbiddenUnlessEmployeeOwner<EducationResponseDto>(
        employeeId,
        user,
      );
      if (denied) {
        return denied;
      }
    }
    const existing = await this.prisma.education.findFirst({
      where: { id, employeeId },
    });

    if (!existing) {
      return ServiceResult.error(ErrorCode.NotFound, this.notFoundMessage);
    }

    const uniquenessError = await this.findUniquenessError(
      employeeId,
      {
        institution: dto.institutionName ?? existing.institution,
        specialty: dto.specialty ?? existing.specialty,
        graduationYear: dto.graduationYear ?? existing.graduationYear,
      },
      id,
    );

    if (uniquenessError) {
      return uniquenessError;
    }

    const updated = await super.update(id, dto, where);
    if (updated.successful) {
      await syncEmployeeExperience(this.prisma, employeeId);
    }
    return updated;
  }

  add(
    employeeId: number,
    dto: CreateEducationDto,
    user: AuthUser,
  ): Promise<ServiceResult<EducationResponseDto>> {
    return this.withEmployeeAccess(employeeId, user, () =>
      this.create(dto, { employeeId }),
    );
  }

  async replaceAll(
    employeeId: number,
    items: CreateEducationDto[],
    user: AuthUser,
  ): Promise<ServiceResult<EducationResponseDto[]>> {
    return this.withEmployeeAccess(employeeId, user, async () => {
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

  remove(
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
      institution: string;
      specialty: string;
      graduationYear: number;
    },
    excludeId?: number,
  ): Promise<ServiceResult<EducationResponseDto> | null> {
    const duplicate = await this.prisma.education.findFirst({
      where: {
        employeeId,
        institution: fields.institution,
        specialty: fields.specialty,
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
}
