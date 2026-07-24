import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class OptionalAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    return true;
  }
}
