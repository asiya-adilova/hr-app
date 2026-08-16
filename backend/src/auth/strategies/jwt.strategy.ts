import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { Role } from '../../common/enums/role.enum';

export type AuthUser = {
  id: number;
  email: string;
  role: Role;
  employeeId: number | null;
};

export type JwtPayload = {
  sub: number;
  email: string;
  role: Role;
  type: 'access' | 'refresh';
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload): Promise<AuthUser> {
    const account = await this.prisma.account.findUnique({
      where: { id: payload.sub },
      include: {
        employee: {
          select: { id: true },
          where: { isDeleted: false },
        },
      },
    });

    if (payload.type === 'refresh') {
      throw new UnauthorizedException('Недействительный токен');
    }

    if (!account) {
      throw new UnauthorizedException('Пользователь не найден');
    }

    return {
      id: account.id,
      email: account.email,
      role: account.role as Role,
      employeeId: account.employee?.id ?? null,
    };
  }
}
