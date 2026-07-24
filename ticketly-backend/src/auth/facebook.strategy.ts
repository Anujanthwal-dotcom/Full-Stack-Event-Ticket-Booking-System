import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-facebook';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';

type VerifyCallback = (err: any, user?: any, info?: any) => void;

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(
    configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      clientID: configService.get<string>('app.oauth.facebook.clientID')!,
      clientSecret: configService.get<string>('app.oauth.facebook.clientSecret')!,
      callbackURL: '/api/auth/facebook/callback',
      scope: ['email', 'public_profile'],
      profileFields: ['id', 'displayName', 'emails', 'photos'],
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
      provider: 'FACEBOOK',
    });

    done(null, user);
  }
}
