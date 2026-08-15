import { Module } from "@nestjs/common";
import { AuthenticationController } from "./auth.controller";
import { AuthenticationService } from "./auth.service";
import { BrandModel, OtpModel, OtpRepository, TokenModel, TokenRepository, UserModel } from "src/DB";
import { UserRepository } from "src/DB/repository/user.repository";
import { JwtService } from "@nestjs/jwt";
import { TokenService } from "src/common";

@Module({
    imports: [UserModel, OtpModel, TokenModel,BrandModel],
    controllers: [AuthenticationController],
    providers: [AuthenticationService, UserRepository, OtpRepository, JwtService, TokenRepository, TokenService],
    exports: [AuthenticationService, TokenService]
})

export class AuthenticationModule { }