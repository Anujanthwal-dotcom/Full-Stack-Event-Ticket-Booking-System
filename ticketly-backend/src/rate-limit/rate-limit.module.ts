import { Module } from '@nestjs/common';
import { RateLimitInterceptor } from './rate-limit.interceptor';
import { APP_INTERCEPTOR } from '@nestjs/core';

@Module({
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: RateLimitInterceptor,
    },
  ],
})
export class RateLimitModule {}
