import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '../../common/enums/role.enum';
import { Roles } from './roles.decorator';

export function Auth(...roles: Role[]) {
  return applyDecorators(
    ApiBearerAuth(),
    ...(roles.length ? [Roles(...roles)] : []),
  );
}
