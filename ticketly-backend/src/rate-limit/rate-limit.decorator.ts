import { SetMetadata } from '@nestjs/common';

export const RATE_LIMIT_KEY = 'rateLimit';
export const RateLimit = (windowMs: number, maxRequests: number) =>
  SetMetadata(RATE_LIMIT_KEY, { windowMs, maxRequests });
