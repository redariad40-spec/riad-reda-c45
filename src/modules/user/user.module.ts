import { Module } from "@nestjs/common";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { AuthenticationGuard } from "src/common/guards/authentication/authentication.guard";
import { Reflector } from "@nestjs/core";
import { AuthenticationModule } from "../auth/auth.module";
import { AuthorizationGuard } from "src/common/guards/authorization/authorization.guard";
import { S3Service } from "src/common/service/s3.service";


@Module({
    imports: [AuthenticationModule],
    controllers: [UserController],
    providers: [UserService, AuthenticationGuard, Reflector, AuthorizationGuard, S3Service],
    exports: [UserService],
})
export class UserModule { }