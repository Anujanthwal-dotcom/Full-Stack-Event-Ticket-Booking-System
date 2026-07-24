import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

interface OAuthProfile {
  providerId: string;
  name: string;
  email: string;
  avatarUrl?: string;
  provider: 'GOOGLE' | 'FACEBOOK';
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  async findOrCreateUser(profile: OAuthProfile) {
    const existing = await this.prisma.user.findUnique({
      where: {
        provider_providerId: {
          provider: profile.provider,
          providerId: profile.providerId,
        },
      },
    });

    if (existing) {
      return this.prisma.user.update({
        where: { id: existing.id },
        data: {
          name: profile.name,
          avatarUrl: profile.avatarUrl,
        },
      });
    }

    return this.prisma.user.create({
      data: {
        provider: profile.provider,
        providerId: profile.providerId,
        name: profile.name,
        email: profile.email,
        avatarUrl: profile.avatarUrl,
      },
    });
  }

  getSuccessRedirect() {
    return this.configService.get<string>('app.oauth.successRedirect');
  }

  getFailureRedirect() {
    return this.configService.get<string>('app.oauth.failureRedirect');
  }
}
