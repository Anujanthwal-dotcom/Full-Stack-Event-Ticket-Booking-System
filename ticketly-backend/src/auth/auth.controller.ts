import {
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { GoogleOAuthGuard, FacebookOAuthGuard } from './oauth.guard';
import { PrismaService } from '../prisma/prisma.service';

@Controller()
export class AuthController {
  constructor(
    private authService: AuthService,
    private prisma: PrismaService,
  ) {}

  @Get('api/user/me')
  async getCurrentUser(@Req() req: Request) {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      return { authenticated: false, user: null };
    }

    const session = (req as any).session;
    const userId = session?.passport?.user;
    if (!userId) {
      return { authenticated: false, user: null };
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return { authenticated: false, user: null };
    }

    return {
      authenticated: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        provider: user.provider,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt.toISOString(),
      },
    };
  }

  @Get('oauth2/authorization/google')
  @UseGuards(GoogleOAuthGuard)
  async googleLogin() {}

  @Get('api/auth/google/callback')
  @UseGuards(GoogleOAuthGuard)
  async googleCallback(@Req() req: Request, @Res() res: Response) {
    req.session.regenerate((err) => {
      if (err) {
        return res.redirect(this.authService.getFailureRedirect()!);
      }
      (req.session as any).passport = { user: (req.user as any).id };
      req.session.save(() => {
        res.redirect(this.authService.getSuccessRedirect()!);
      });
    });
  }

  @Get('oauth2/authorization/facebook')
  @UseGuards(FacebookOAuthGuard)
  async facebookLogin() {}

  @Get('api/auth/facebook/callback')
  @UseGuards(FacebookOAuthGuard)
  async facebookCallback(@Req() req: Request, @Res() res: Response) {
    req.session.regenerate((err) => {
      if (err) {
        return res.redirect(this.authService.getFailureRedirect()!);
      }
      (req.session as any).passport = { user: (req.user as any).id };
      req.session.save(() => {
        res.redirect(this.authService.getSuccessRedirect()!);
      });
    });
  }

  @Post('logout')
  logout(@Req() req: Request, @Res() res: Response) {
    req.logout((err: any) => {
      if (err) {
        return res.status(500).json({ error: 'Logout failed' });
      }
      req.session.destroy(() => {
        res.clearCookie('connect.sid');
        res.json({ message: 'Logged out' });
      });
    });
  }
}
