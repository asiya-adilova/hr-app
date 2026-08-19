import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { runWithCurrentUser } from '../current-user.store';
import type { AuthUser } from '../strategies/jwt.strategy';

@Injectable()
export class CurrentUserInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<{ user?: AuthUser }>();

    return new Observable((subscriber) => {
      return runWithCurrentUser(request.user, () =>
        next.handle().subscribe(subscriber),
      );
    });
  }
}
