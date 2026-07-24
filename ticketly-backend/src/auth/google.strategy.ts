import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, type VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      clientID: configService.get<string>('app.oauth.google.clientID')!,
      clientSecret: configService.get<string>('app.oauth.google.clientSecret')!,
      callbackURL: '/api/auth/google/callback',
      scope: ['email', 'profile'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<void> {
    const { id, displayName, emails, photos } = profile;

    const user = await this.authService.findOrCreateUser({
      providerId: id,
      name: displayName,
      email: emails?.[0]?.value,
      avatarUrl: photos?.[0]?.value,
      provider: 'GOOGLE',
    });

    done(null, user);
  }
}
