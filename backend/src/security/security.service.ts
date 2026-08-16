import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { createHash } from 'node:crypto';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { ErrorCode } from '../common/enums/error-code.enum';
import { Role } from '../common/enums/role.enum';
import { ServiceResult } from '../common/response/service-result';
import { LoginDto, RegisterDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { AuthResponseDto, AccountResponseDto } from './dto/auth-response.dto';
import { JwtPayload } from './strategies/jwt.strategy';
import type { AuthUser } from './strategies/jwt.strategy';

type JwtExpiresIn = `${number}${'s' | 'm' | 'h' | 'd'}`;

type AccountAuthFields = {
  id: number;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  middleName: string | null;
};

@Injectable()
export class SecurityService {
  private readonly accessSecret: string;
  private readonly refreshSecret: string;
  private readonly accessExpiresIn: JwtExpiresIn;
  private readonly refreshExpiresIn: JwtExpiresIn;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    configService: ConfigService,
  ) {
    this.accessSecret = configService.getOrThrow<string>('JWT_SECRET');
    this.refreshSecret = configService.getOrThrow<string>('JWT_REFRESH_SECRET');
    this.accessExpiresIn = (configService.get<string>('JWT_EXPIRES_IN') ??
      '1d') as JwtExpiresIn;
    this.refreshExpiresIn = (configService.get<string>(
      'JWT_REFRESH_EXPIRES_IN',
    ) ?? '7d') as JwtExpiresIn;
  }

  async register(dto: RegisterDto): Promise<ServiceResult<AuthResponseDto>> {
    const existing = await this.prisma.account.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      return ServiceResult.error(
        ErrorCode.DuplicateData,
        'Аккаунт с указанным email уже существует',
      );
    }

    const password = await bcrypt.hash(dto.password, 10);

    const account = await this.prisma.account.create({
      data: {
        email: dto.email,
        password,
        role: Role.EMPLOYEE,
        firstName: dto.firstName,
        lastName: dto.lastName,
        middleName: dto.middleName,
      },
    });

    return ServiceResult.success(await this.issueTokens(account));
  }

  async login(dto: LoginDto): Promise<ServiceResult<AuthResponseDto>> {
    const account = await this.prisma.account.findUnique({
      where: { email: dto.email },
    });

    if (!account) {
      return ServiceResult.error(
        ErrorCode.Unauthorized,
        'Неверный email или пароль',
      );
    }

    const passwordMatches = await bcrypt.compare(
      dto.password,
      account.password,
    );

    if (!passwordMatches) {
      return ServiceResult.error(
        ErrorCode.Unauthorized,
        'Неверный email или пароль',
      );
    }

    return ServiceResult.success(await this.issueTokens(account));
  }

  async refresh(dto: RefreshTokenDto): Promise<ServiceResult<AuthResponseDto>> {
    const payload = await this.verifyRefreshToken(dto.refreshToken);
    if (!payload) {
      return this.invalidRefreshToken();
    }

    const stored = await this.prisma.refreshToken.findUnique({
      where: { tokenHash: hashToken(dto.refreshToken) },
    });

    if (
      !stored ||
      stored.revokedAt ||
      stored.expiresAt.getTime() <= Date.now() ||
      stored.accountId !== payload.sub
    ) {
      return this.invalidRefreshToken();
    }

    const account = await this.prisma.account.findUnique({
      where: { id: payload.sub },
    });

    if (!account) {
      return this.invalidRefreshToken();
    }

    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });

    return ServiceResult.success(await this.issueTokens(account));
  }

  async me(user: AuthUser): Promise<ServiceResult<AccountResponseDto>> {
    const account = await this.prisma.account.findUnique({
      where: { id: user.id },
    });

    if (!account) {
      return ServiceResult.error(
        ErrorCode.Unauthorized,
        'Пользователь не найден',
      );
    }

    return ServiceResult.success(
      this.toAccountResponse(account, user.employeeId),
    );
  }

  private async issueTokens(
    account: AccountAuthFields,
  ): Promise<AuthResponseDto> {
    const role = account.role as Role;
    const accessPayload: JwtPayload = {
      sub: account.id,
      email: account.email,
      role,
      type: 'access',
    };
    const refreshPayload: JwtPayload = {
      sub: account.id,
      email: account.email,
      role,
      type: 'refresh',
    };

    const accessToken = this.jwtService.sign(accessPayload, {
      secret: this.accessSecret,
      expiresIn: this.accessExpiresIn,
    });
    const refreshToken = this.jwtService.sign(refreshPayload, {
      secret: this.refreshSecret,
      expiresIn: this.refreshExpiresIn,
    });

    await this.prisma.refreshToken.create({
      data: {
        accountId: account.id,
        tokenHash: hashToken(refreshToken),
        expiresAt: new Date(Date.now() + durationToMs(this.refreshExpiresIn)),
      },
    });

    const employee = await this.prisma.employee.findFirst({
      where: { accountId: account.id },
      select: { id: true },
    });

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: this.accessExpiresIn,
      account: this.toAccountResponse(account, employee?.id ?? null),
    };
  }

  private toAccountResponse(
    account: AccountAuthFields,
    employeeId: number | null,
  ): AccountResponseDto {
    return {
      id: account.id,
      email: account.email,
      role: account.role as Role,
      firstName: account.firstName,
      lastName: account.lastName,
      middleName: account.middleName ?? undefined,
      employeeId,
    };
  }

  private async verifyRefreshToken(token: string): Promise<JwtPayload | null> {
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: this.refreshSecret,
      });

      if (payload.type !== 'refresh' || !payload.sub) {
        return null;
      }

      return payload;
    } catch {
      return null;
    }
  }

  private invalidRefreshToken(): ServiceResult<AuthResponseDto> {
    return ServiceResult.error(
      ErrorCode.InvalidToken,
      'Недействительный токен обновления',
    );
  }
}

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

function durationToMs(value: string): number {
  const match = /^(\d+)([smhd])$/.exec(value.trim());
  if (!match) {
    return 7 * 24 * 60 * 60 * 1000;
  }

  const amount = Number(match[1]);
  switch (match[2]) {
    case 's':
      return amount * 1000;
    case 'm':
      return amount * 60 * 1000;
    case 'h':
      return amount * 60 * 60 * 1000;
    case 'd':
      return amount * 24 * 60 * 60 * 1000;
    default:
      return 7 * 24 * 60 * 60 * 1000;
  }
}
