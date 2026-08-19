import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ErrorCode } from '../common/enums/error-code.enum';
import { ServiceResult } from '../common/response/service-result';
import { ErrorMessage } from '../common/messages/error-message';
import { BaseService } from '../common/services/base.service';
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
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  // #region PUBLIC API (CONTROLLER ENDPOINTS)

  getAllByEmployeeId(
    employeeId: number,
  ): Promise<ServiceResult<RelativeResponseDto[]>> {
    return this.withEmployeeAccess(employeeId, () =>
      super.getAll({ employeeId }),
    );
  }

  override async getById(
    id: number,
    where: Record<string, unknown> = {},
  ): Promise<ServiceResult<RelativeResponseDto>> {
    const employeeId = where.employeeId as number;
    return this.withEmployeeAccess(employeeId, () => super.getById(id, where));
  }

  override async create(
    dto: CreateRelativeDto,
    extra: Record<string, unknown> = {},
  ): Promise<ServiceResult<RelativeResponseDto>> {
    const employeeId = extra.employeeId as number;
    return this.withEmployeeAccess(employeeId, async () => {
      const missing = await this.ensureEmployeeExists<RelativeResponseDto>(
        employeeId,
      );
      if (missing) {
        return missing;
      }

      const uniquenessError = await this.findUniquenessError(employeeId, {
        fullName: dto.fullName,
        relationship: dto.relationshipType,
      });

      if (uniquenessError) {
        return uniquenessError;
      }

      return super.create(dto, extra);
    });
  }

  override async update(
    id: number,
    dto: UpdateRelativeDto,
    where: Record<string, unknown> = {},
  ): Promise<ServiceResult<RelativeResponseDto>> {
    const employeeId = where.employeeId as number;
    return this.withEmployeeAccess(employeeId, async () => {
      const existing = await this.prisma.relative.findFirst({
        where: { id, employeeId },
      });

      if (!existing) {
        return ServiceResult.error(
          ErrorCode.NotFound,
          ErrorMessage.relativeNotFound,
        );
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
    });
  }

  override async delete(
    id: number,
    where: Record<string, unknown> = {},
  ): Promise<ServiceResult<void>> {
    const employeeId = where.employeeId as number;
    return this.withEmployeeAccess(employeeId, () => super.delete(id, where));
  }

  // #endregion

  // #region PROTECTED METHODS

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
    return EmployeeMapper.toRelativeUpdateData(dto);
  }

  // #endregion

  // #region PRIVATE HELPERS

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

  // #endregion
}
