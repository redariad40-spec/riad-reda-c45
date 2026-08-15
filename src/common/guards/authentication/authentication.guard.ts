import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { tokenName } from 'src/common/decorators';
import { TokentypeEnum } from 'src/common/enums';
import { TokenService } from 'src/common/service';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  constructor(
    private readonly tokenService: TokenService,
    private readonly reflector: Reflector
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const tokentype: TokentypeEnum = this.reflector.getAllAndOverride<TokentypeEnum>(tokenName, [
      context.getHandler(),
      context.getClass(),
    ]) ?? TokentypeEnum.access;

    console.log({ context, tokentype });

    let req: any;
    let authorization: string = '';


    switch (context.getType()) {
      case 'http':
        const httpCtx = context.switchToHttp();
        req = httpCtx.getRequest();
        authorization = req.headers.authorization;
        break;
      default:
        break;
    }
    const { decoded, user } = await this.tokenService.decodedToken({
      authorization,
      tokentype,
    });

    req.credentials = { decoded, user }; // ✅ التصحيح هنا
    return true;
  }
}
