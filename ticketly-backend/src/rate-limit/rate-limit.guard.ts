import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';

interface RateLimitBucket {
  count: number;
  resetAt: number;
}

@Injectable()
export class RateLimitGuard implements CanActivate {
  private buckets = new Map<string, RateLimitBucket>();
  private cleanupInterval: ReturnType<typeof setInterval>;

  constructor(
    private readonly windowMs: number,
    private readonly maxRequests: number,
  ) {
    this.cleanupInterval = setInterval(() => this.cleanup(), 60_000);
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const ip = this.getClientIp(request);
    const now = Date.now();
    const bucketKey = `${ip}:${context.getHandler().name}`;

    let bucket = this.buckets.get(bucketKey);

    if (!bucket || now > bucket.resetAt) {
      bucket = { count: 1, resetAt: now + this.windowMs };
      this.buckets.set(bucketKey, bucket);
      return true;
    }

    bucket.count++;

    if (bucket.count > this.maxRequests) {
      throw new HttpException(
        { error: 'Too many requests' },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }

  private getClientIp(request: any): string {
    return (
      request.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      request.ip ||
      request.connection?.remoteAddress ||
      'unknown'
    );
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, bucket] of this.buckets) {
      if (now > bucket.resetAt) {
        this.buckets.delete(key);
      }
    }
  }
}
