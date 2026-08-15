import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { roleName } from 'src/common/decorators/role.decorators';
import { RoleEnum } from 'src/common/enums';

@Injectable()
export class AuthorizationGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const accessRoles: RoleEnum[] = this.reflector.getAllAndOverride<RoleEnum[]>(roleName, [
      context.getHandler(),
      context.getClass(),
    ]) ?? [];

    console.log({ context, accessRoles });

    let role: RoleEnum=RoleEnum.user;

    switch (context.getType()) {
      case 'http':
        role = context.switchToHttp().getRequest().credentials?.user?.role;
        if (!role) {
          throw new UnauthorizedException('User credentials missing or invalid');
        }
        break;
      default:
        break;
    }

    return accessRoles.includes(role);
  }
}
