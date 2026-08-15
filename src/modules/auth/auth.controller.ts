import {
    Body,
    Controller,
    HttpCode,
    Patch,
    Post,
    UsePipes,
    ValidationPipe,


} from '@nestjs/common';
import { AuthenticationService } from './auth.service';
import { ConfirmEamilBodyDto, LoginBodyDto, ResendConfirmEamilBodyDto, SignupBodyDto } from './dto/signup.dto';
import { LoginResponse } from './entites/auth.entity';
import { IResponse, successResponse } from 'src/common';

@UsePipes(
    new ValidationPipe({
        stopAtFirstError: true,
        whitelist: true,
        forbidNonWhitelisted: true,
        skipMissingProperties: true,
    }),
)


@Controller('auth')

export class AuthenticationController {
    constructor(private readonly authenticationService: AuthenticationService) { }

    @Post("signup")
    async signup(@Body() body: SignupBodyDto): Promise<IResponse> {
        console.log(body);
        await this.authenticationService.signup(body);
        return successResponse()
    }


    @Post("Resend_Confirm_Email")
    async resendconfirmEmail(@Body() body: ResendConfirmEamilBodyDto): Promise<IResponse> {
        console.log(body);
        await this.authenticationService.resendconfirmEmail(body);
        return successResponse()
    }

    @Patch("Confirm_Email")
    async confirmEmail(@Body() body: ConfirmEamilBodyDto): Promise<IResponse> {
        console.log(body);
        await this.authenticationService.confirmEmail(body);
        return successResponse()
    }



    @Post("login")
    async login(@Body() body: LoginBodyDto): Promise<IResponse<LoginResponse>> {
        console.log(body);

        const credentials = await this.authenticationService.login(body)
        return successResponse<LoginResponse>({
            message: "Done",
            data: { credentials }
        });
    }
}