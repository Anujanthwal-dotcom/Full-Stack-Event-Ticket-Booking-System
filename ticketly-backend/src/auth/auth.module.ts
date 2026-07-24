import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { GoogleStrategy } from './google.strategy';
import { FacebookStrategy } from './facebook.strategy';

@Module({
  imports: [PassportModule.register({ session: true })],
  controllers: [AuthController],
  providers: [AuthService, GoogleStrategy, FacebookStrategy],
  exports: [AuthService],
})
export class AuthModule {}
