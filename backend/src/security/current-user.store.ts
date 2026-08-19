import { AsyncLocalStorage } from 'node:async_hooks';
import { UnauthorizedException } from '@nestjs/common';
import type { AuthUser } from './strategies/jwt.strategy';

const currentUserStorage = new AsyncLocalStorage<AuthUser>();

export function runWithCurrentUser<T>(
  user: AuthUser | undefined,
  callback: () => T,
): T {
  if (!user) {
    return callback();
  }

  return currentUserStorage.run(user, callback);
}

export function getCurrentUser(): AuthUser {
  const user = currentUserStorage.getStore();
  if (!user) {
    throw new UnauthorizedException('Пользователь не найден');
  }

  return user;
}
