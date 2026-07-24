import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard as PassportAuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';

@Injectable()
export class GoogleOAuthGuard extends PassportAuthGuard('google') {
  constructor(private configService: ConfigService) {
    super();
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    if (err || !user) {
      const res = context.switchToHttp().getResponse<Response>();
      res.redirect(
        this.configService.get<string>('app.oauth.failureRedirect')!,
      );
      return;
    }
    return user;
  }
}

@Injectable()
export class FacebookOAuthGuard extends PassportAuthGuard('facebook') {
  constructor(private configService: ConfigService) {
    super();
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    if (err || !user) {
      const res = context.switchToHttp().getResponse<Response>();
      res.redirect(
        this.configService.get<string>('app.oauth.failureRedirect')!,
      );
      return;
    }
    return user;
  }
}
