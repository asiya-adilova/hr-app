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

    return super.create(dto, extra);
  }

  override async update(
    id: number,
    dto: UpdateEducationDto,
    where: Record<string, unknown> = {},
  ): Promise<ServiceResult<EducationResponseDto>> {
    const employeeId = where.employeeId as number;
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

    return super.update(id, dto, where);
  }

  async add(
    employeeId: number,
    dto: CreateEducationDto,
  ): Promise<ServiceResult<EducationResponseDto>> {
    return this.create(dto, { employeeId });
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
