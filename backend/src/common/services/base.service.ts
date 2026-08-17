import { Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ErrorCode } from '../enums/error-code.enum';
import { Role } from '../enums/role.enum';
import { PagedResult } from '../response/paged-result';
import { ServiceResult } from '../response/service-result';
import type { AuthUser } from '../../security/strategies/jwt.strategy';

export type Identifiable = {
  id: number;
};

export type SoftDeletable = Identifiable & {
  isDeleted: boolean;
  deletedAt: Date | null;
};

export abstract class BaseService<
  TModel extends Identifiable,
  TResponse,
  TCreate = unknown,
  TUpdate = unknown,
  TListResponse = TResponse,
> {
  protected readonly logger = new Logger(this.constructor.name);

  protected constructor(protected readonly prisma: PrismaService) {}

  protected abstract readonly notFoundMessage: string;

  protected abstract getDelegate(): any;

  protected abstract toResponse(model: TModel): TResponse;

  protected toCreateData(dto: TCreate): unknown {
    return dto;
  }

  protected toUpdateData(dto: TUpdate): unknown {
    return dto;
  }

  protected toListResponse(model: TModel): TListResponse {
    return this.toResponse(model) as unknown as TListResponse;
  }

  protected getByIdInclude(): unknown {
    return undefined;
  }

  protected getListInclude(): unknown {
    return undefined;
  }

  protected getDefaultOrderBy(): unknown {
    return { id: 'desc' };
  }

  protected isAdmin(user: AuthUser): boolean {
    return user.role === Role.ADMIN;
  }

  protected isOwner(
    objectOwnerId: number | null | undefined,
    currentUserId: number | null | undefined,
  ): boolean {
    if (objectOwnerId == null || currentUserId == null) {
      return false;
    }

    return objectOwnerId === currentUserId;
  }

  protected canAccessEmployee(employeeId: number, user: AuthUser): boolean {
    return this.isAdmin(user) || this.isOwner(employeeId, user.employeeId);
  }

  protected forbiddenUnlessEmployeeOwner<T>(
    employeeId: number,
    user: AuthUser,
  ): ServiceResult<T> | null {
    if (this.canAccessEmployee(employeeId, user)) {
      return null;
    }

    return ServiceResult.error(
      ErrorCode.Forbidden,
      'Недостаточно прав для доступа к данным этого сотрудника',
    );
  }

  protected async withEmployeeAccess<T>(
    employeeId: number,
    user: AuthUser,
    action: () => Promise<ServiceResult<T>>,
  ): Promise<ServiceResult<T>> {
    const denied = this.forbiddenUnlessEmployeeOwner<T>(employeeId, user);
    if (denied) {
      return denied;
    }

    return action();
  }

  async getById(
    id: number,
    where: Record<string, unknown> = {},
  ): Promise<ServiceResult<TResponse>> {
    const model = await this.getDelegate().findFirst({
      where: { id, ...where },
      include: this.getByIdInclude(),
    });

    if (!model) {
      return ServiceResult.error(ErrorCode.NotFound, this.notFoundMessage);
    }

    return ServiceResult.success(this.toResponse(model));
  }

  async getAll(
    where: Record<string, unknown> = {},
  ): Promise<ServiceResult<TResponse[]>> {
    const records = await this.getDelegate().findMany({
      where,
      orderBy: this.getDefaultOrderBy(),
      include: this.getByIdInclude(),
    });

    return ServiceResult.success(
      records.map((record: TModel) => this.toResponse(record)),
    );
  }

  async search(name?: string): Promise<ServiceResult<TResponse[]>> {
    const term = name?.trim();
    if (!term) {
      return this.getAll();
    }

    return this.getAll({
      name: {
        contains: term,
        mode: 'insensitive',
      },
    });
  }

  async getAllPaged(
    pageSize: number,
    pageIndex: number,
    where: Record<string, unknown> = {},
  ): Promise<ServiceResult<PagedResult<TListResponse>>> {
    const skip = (pageIndex - 1) * pageSize;
    const delegate = this.getDelegate();

    const [records, totalCount] = await Promise.all([
      delegate.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: this.getDefaultOrderBy(),
        include: this.getListInclude(),
      }),
      delegate.count({ where }),
    ]);

    return ServiceResult.success(
      new PagedResult(
        records.map((record: TModel) => this.toListResponse(record)),
        pageIndex,
        pageSize,
        totalCount,
      ),
    );
  }

  async create(
    dto: TCreate,
    extra: Record<string, unknown> = {},
  ): Promise<ServiceResult<TResponse>> {
    const created = await this.getDelegate().create({
      data: {
        ...(this.toCreateData(dto) as object),
        ...extra,
      },
    });

    return this.getById(created.id, extra);
  }

  async update(
    id: number,
    dto: TUpdate,
    where: Record<string, unknown> = {},
  ): Promise<ServiceResult<TResponse>> {
    const existing = await this.getDelegate().findFirst({
      where: { id, ...where },
    });

    if (!existing) {
      return ServiceResult.error(ErrorCode.NotFound, this.notFoundMessage);
    }

    await this.getDelegate().update({
      where: { id },
      data: this.toUpdateData(dto),
    });

    return this.getById(id, where);
  }

  async delete(
    id: number,
    where: Record<string, unknown> = {},
  ): Promise<ServiceResult<void>> {
    const existing = await this.getDelegate().findFirst({
      where: { id, ...where },
    });

    if (!existing) {
      return ServiceResult.error(ErrorCode.NotFound, this.notFoundMessage);
    }

    await this.getDelegate().update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });

    return ServiceResult.success();
  }
}
