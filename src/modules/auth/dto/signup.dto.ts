import {
    IsEmail,
    IsNotEmpty,
    IsString,
    IsStrongPassword,
    Length,
    Matches,
    matches,
    ValidateIf,

} from "class-validator";
import { IsMatch } from "src/common";


export class ResendConfirmEamilBodyDto {
    @IsEmail()
    email: string;
}


export class ConfirmEamilBodyDto extends ResendConfirmEamilBodyDto {
    @Matches(/^\d{6}$/)
    code: string;
}
export class LoginBodyDto extends ResendConfirmEamilBodyDto {


    @IsStrongPassword()
    password: string;

}
export class SignupBodyDto extends LoginBodyDto {
    @Length(2, 52, { message: "username min2 is max 52 character" })
    @IsNotEmpty()
    @IsString()
    username: string;

    @ValidateIf((data: SignupBodyDto) => {
        return Boolean(data.password)
    })
    @IsMatch<string>(['password'])
    confirmpassword: string

}