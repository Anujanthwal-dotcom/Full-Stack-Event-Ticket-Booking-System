import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';
import passport from 'passport';
import expressSession from 'express-session';
import { createClient } from 'redis';
import { RedisStore } from 'connect-redis';
import { PrismaService } from './prisma/prisma.service';
import helmet from 'helmet';
import express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const prisma = app.get(PrismaService);

  const redisClient = createClient({
    url: `redis://${configService.get<string>('app.session.redis.host')}:${configService.get<number>('app.session.redis.port')}`,
  });
  redisClient.connect().catch(console.error);

  const redisStore = new RedisStore({
    client: redisClient as any,
    prefix: 'ticketly:',
  });

  const isProduction = configService.get<string>('NODE_ENV') === 'production';

  app.use(helmet());

  app.use(
    express.json({
      verify: (req: any, _res, buf) => {
        if (req.originalUrl === '/api/payments/webhook') {
          req.rawBody = buf;
        }
      },
    }),
  );

  app.use(
    expressSession({
      store: redisStore as any,
      secret: configService.get<string>('app.session.secret')!,
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
      },
    }),
  );

  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser((user: any, done: any) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done: any) => {
    try {
      const user = await prisma.user.findUnique({ where: { id } });
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  app.enableCors({
    origin: configService.get<string>('app.cors.origin'),
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());

  const port = configService.get<number>('app.port')!;
  await app.listen(port);
  console.log(`Ticketly backend running on http://localhost:${port}`);
}

bootstrap();
