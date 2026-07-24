import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { createKeyv } from '@keyv/redis';
import configuration from './config/configuration';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ShowsModule } from './shows/shows.module';
import { TicketsModule } from './tickets/tickets.module';
import { PaymentsModule } from './payments/payments.module';
import { AiSearchModule } from './ai-search/ai-search.module';
import { StorageModule } from './storage/storage.module';
import { NotificationModule } from './notification/notification.module';
import { RateLimitModule } from './rate-limit/rate-limit.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const host = configService.get<string>('app.session.redis.host');
        const port = configService.get<number>('app.session.redis.port');
        return {
          stores: [createKeyv(`redis://${host}:${port}`)],
          ttl: 60_000,
        };
      },
      inject: [ConfigService],
    }),
    PrismaModule,
    AuthModule,
    ShowsModule,
    TicketsModule,
    PaymentsModule,
    AiSearchModule,
    StorageModule,
    NotificationModule,
    RateLimitModule,
  ],
})
export class AppModule {}
