import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ErrorCode } from '../common/enums/error-code.enum';
import { ServiceResult } from '../common/response/service-result';
import { BaseService } from '../common/services/base.service';
import { ensureEmployeeExists } from '../common/helpers/ensure-employee-exists';
import { EmployeeMapper } from '../employees/mappings/employee-mapper';
import { RelativeResponseDto } from './dto/response/relative-response.dto';
import { CreateRelativeDto } from './dto/request/create-relative-request.dto';
import { UpdateRelativeDto } from './dto/request/update-relative-request.dto';
import type { Relative } from '../../generated/prisma/client';

@Injectable()
export class RelativesService extends BaseService<
  Relative,
  RelativeResponseDto,
  CreateRelativeDto,
  UpdateRelativeDto
> {
  protected readonly notFoundMessage = 'Родственник не найден';

  constructor(prisma: PrismaService) {
    super(prisma);
  }

  protected getDelegate() {
    return this.prisma.relative;
  }

  protected toResponse(model: Relative): RelativeResponseDto {
    return EmployeeMapper.toRelativeResponse(model);
  }

  protected toCreateData(dto: CreateRelativeDto) {
    return EmployeeMapper.toRelativeCreateData(dto);
  }

  protected toUpdateData(dto: UpdateRelativeDto) {
    return {
      ...(dto.fullName !== undefined && { fullName: dto.fullName }),
      ...(dto.relationshipType !== undefined && {
        relationship: dto.relationshipType,
      }),
      ...(dto.birthDate !== undefined && {
        birthDate: dto.birthDate ? new Date(dto.birthDate) : null,
      }),
      ...(dto.phone !== undefined && { phone: dto.phone }),
      ...(dto.occupation !== undefined && { workplace: dto.occupation }),
    };
  }

  async findByEmployeeId(employeeId: number): Promise<RelativeResponseDto[]> {
    const result = await this.getAll({ employeeId });
    return result.result ?? [];
  }

  override async create(
    dto: CreateRelativeDto,
    extra: Record<string, unknown> = {},
  ): Promise<ServiceResult<RelativeResponseDto>> {
    const employeeId = extra.employeeId as number;
    const employee = await ensureEmployeeExists(this.prisma, employeeId);
    if (!employee.successful) {
      return ServiceResult.error(
        employee.errorInfo?.code ?? ErrorCode.NotFound,
        employee.errorInfo?.message ?? 'Сотрудник не найден',
      );
    }

    const uniquenessError = await this.findUniquenessError(employeeId, {
      fullName: dto.fullName,
      relationship: dto.relationshipType,
    });

    if (uniquenessError) {
      return uniquenessError;
    }

    return super.create(dto, extra);
  }

  override async update(
    id: number,
    dto: UpdateRelativeDto,
    where: Record<string, unknown> = {},
  ): Promise<ServiceResult<RelativeResponseDto>> {
    const employeeId = where.employeeId as number;
    const existing = await this.prisma.relative.findFirst({
      where: { id, employeeId },
    });

    if (!existing) {
      return ServiceResult.error(ErrorCode.NotFound, this.notFoundMessage);
    }

    const uniquenessError = await this.findUniquenessError(
      employeeId,
      {
        fullName: dto.fullName ?? existing.fullName,
        relationship: dto.relationshipType ?? existing.relationship,
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
    dto: CreateRelativeDto,
  ): Promise<ServiceResult<RelativeResponseDto>> {
    return this.create(dto, { employeeId });
  }

  private async findUniquenessError(
    employeeId: number,
    fields: {
      fullName: string;
      relationship: string;
    },
    excludeId?: number,
  ): Promise<ServiceResult<RelativeResponseDto> | null> {
    const duplicate = await this.prisma.relative.findFirst({
      where: {
        employeeId,
        fullName: fields.fullName,
        relationship: fields.relationship,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
    });

    if (!duplicate) {
      return null;
    }

    return ServiceResult.error(
      ErrorCode.DuplicateData,
      'Родственник с такими данными уже существует',
    );
  }
}
