import { PrismaService } from '../../prisma/prisma.service';
import { ErrorCode } from '../enums/error-code.enum';
import { Role } from '../enums/role.enum';
import { ErrorMessage } from '../messages/error-message';
import { PagedResult } from '../response/paged-result';
import { ServiceResult } from '../response/service-result';
import { getCurrentUser } from '../../security/current-user.store';
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
  protected constructor(protected readonly prisma: PrismaService) {}

  // #region PUBLIC API (CONTROLLER ENDPOINTS)

  async getById(
    id: number,
    where: Record<string, unknown> = {},
  ): Promise<ServiceResult<TResponse>> {
    const model = await this.getDelegate().findFirst({
      where: { id, ...where },
      include: this.getByIdInclude(),
    });

    if (!model) {
      return ServiceResult.error(ErrorCode.NotFound, ErrorMessage.notFound);
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
      return ServiceResult.error(ErrorCode.NotFound, ErrorMessage.notFound);
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
      return ServiceResult.error(ErrorCode.NotFound, ErrorMessage.notFound);
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

  // #endregion

  // #region PROTECTED METHODS

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

  protected getCurrentUser(): AuthUser {
    return getCurrentUser();
  }

  protected isAdmin(): boolean {
    return this.getCurrentUser().role === Role.ADMIN;
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

  protected async withEmployeeAccess<T>(
    employeeId: number,
    action: () => Promise<ServiceResult<T>>,
  ): Promise<ServiceResult<T>> {
    const denied = await this.forbiddenUnlessEmployeeOwner<T>(employeeId);
    if (denied) {
      return denied;
    }

    return action();
  }

  protected async ensureEmployeeExists<T>(
    employeeId: number,
  ): Promise<ServiceResult<T> | null> {
    const employee = await this.prisma.employee.findFirst({
      where: { id: employeeId },
      select: { id: true },
    });

    if (employee) {
      return null;
    }

    return ServiceResult.error(
      ErrorCode.NotFound,
      ErrorMessage.employeeNotFound,
    );
  }

  // #endregion

  // #region PRIVATE HELPERS

  private async canAccessEmployee(employeeId: number): Promise<boolean> {
    const user = this.getCurrentUser();
    if (this.isAdmin() || this.isOwner(employeeId, user.employeeId)) {
      return true;
    }

    // Same request as first profile create: JWT still has employeeId = null.
    if (user.employeeId != null) {
      return false;
    }

    const employee = await this.prisma.employee.findFirst({
      where: { id: employeeId, accountId: user.id },
      select: { id: true },
    });

    return employee != null;
  }

  private async forbiddenUnlessEmployeeOwner<T>(
    employeeId: number,
  ): Promise<ServiceResult<T> | null> {
    if (await this.canAccessEmployee(employeeId)) {
      return null;
    }

    return ServiceResult.error(
      ErrorCode.Forbidden,
      ErrorMessage.employeeAccessDenied,
    );
  }

  // #endregion
}
