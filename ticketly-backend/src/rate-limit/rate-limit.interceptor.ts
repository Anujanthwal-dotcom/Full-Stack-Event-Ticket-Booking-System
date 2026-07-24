import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Observable } from 'rxjs';
import { RATE_LIMIT_KEY } from './rate-limit.decorator';
import { RateLimitGuard } from './rate-limit.guard';

@Injectable()
export class RateLimitInterceptor implements NestInterceptor {
  private guards = new Map<string, RateLimitGuard>();

  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const metadata = this.reflector.get<{ windowMs: number; maxRequests: number }>(
      RATE_LIMIT_KEY,
      context.getHandler(),
    );

    if (metadata) {
      const key = `${context.getHandler().name}:${metadata.windowMs}:${metadata.maxRequests}`;
      if (!this.guards.has(key)) {
        this.guards.set(key, new RateLimitGuard(metadata.windowMs, metadata.maxRequests));
      }
      const guard = this.guards.get(key)!;
      guard.canActivate(context);
    }

    return next.handle();
  }
}
