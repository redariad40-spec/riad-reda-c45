
import { applyDecorators, UseGuards } from '@nestjs/common';
import { RoleEnum, TokentypeEnum } from '../enums';
import { Token } from './tokenType.decorators';
import { Roles } from './role.decorators';
import { AuthenticationGuard } from '../guards/authentication/authentication.guard';
import { AuthorizationGuard } from '../guards/authorization/authorization.guard';

export function Auth(roles: RoleEnum[], type: TokentypeEnum = TokentypeEnum.access) {
    return applyDecorators(
        Token(type),
        Roles(roles),
        UseGuards(AuthenticationGuard,AuthorizationGuard)

    );
}
