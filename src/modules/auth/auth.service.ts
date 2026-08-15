import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { CompareHash, emailevent, generateNumberOtp, IUsers, LoginCredentialsResponse, OtpEnum, ProviderEnum, TokenService } from "src/common";
import { ConfirmEamilBodyDto, LoginBodyDto, ResendConfirmEamilBodyDto, SignupBodyDto } from "./dto/signup.dto";
import { UserRepository } from "src/DB/repository/user.repository";
import { OtpRepository, TokenRepository, UserDocument } from "src/DB";
import { Types } from "mongoose";
import { JwtService } from "@nestjs/jwt";



@Injectable()
export class AuthenticationService {
    private users: IUsers[] = []
    constructor(
        private readonly userRepository: UserRepository,
        private readonly otpRepository: OtpRepository,
        private readonly jwtService: JwtService,
        private readonly tokenRepository: TokenRepository,
        private readonly tokenService: TokenService
    ) { }

    private async CreateConfirmEmailotp(userId: Types.ObjectId) {

        await this.otpRepository.create({
            data: [
                {
                    code: generateNumberOtp().toString(),
                    expiredAt: new Date(Date.now() + 2 * 60 * 1000),
                    createdBy: userId,
                    otp: OtpEnum.ConfirmEmail,
                }
            ]
        }

        );

    }

    async signup(data: SignupBodyDto): Promise<string> {
        const { username, password, email } = data;

        const CheckUserExist = await this.userRepository.findOne({
            filter: { email },
        });
        if (CheckUserExist) {
            throw new ConflictException("Email already exists");
        }

        // إنشاء المستخدم
        const users = await this.userRepository.create({
            data: [
                {
                    username,
                    email,
                    password,
                }
            ]
        }

        );
        const user = users?.[0];
        if (!user) {
            throw new BadRequestException("Failed to create user");
        }

        await this.CreateConfirmEmailotp(user._id);

        return "Done";
    }

    async login(data: LoginBodyDto): Promise<LoginCredentialsResponse> {
        const { password, email } = data;

        const user = await this.userRepository.findOne({
            filter: {
                email,
                confirmedAt: { $exists: true },
                provider: ProviderEnum.SYSTEM
            },
        });

        if (!user) {
            throw new NotFoundException("Failed to find match account user");
        }

        const isMatch = await CompareHash(password, user.password);
        if (!isMatch) {
            throw new BadRequestException("Invalid  to match password ");
        }

        console.log({ user });

        return await this.tokenService.generateLoginCredential(user as UserDocument);
    }
    

    async resendconfirmEmail(data: ResendConfirmEamilBodyDto): Promise<string> {
        const { email } = data;

        const user = await this.userRepository.findOne({
            filter: { email, confirmedAt: { $exists: false } },
            options: {
                populate: [{ path: "otp", match: { otp: OtpEnum.ConfirmEmail } }]
            }
        });

        if (!user) {
            throw new NotFoundException("Failed to find match account user");
        }

        if (user.otp?.length) {
            throw new ConflictException("sorry to the find otp exists")
        }
        await this.CreateConfirmEmailotp(user._id);

        return "Done";
    }

    async confirmEmail(data: ConfirmEamilBodyDto): Promise<string> {
        const { email, code } = data;

        const user = await this.userRepository.findOne({
            filter: { email, confirmedAt: { $exists: false } },
        });
        if (!user) {
            throw new NotFoundException("Failed to find match account user");
        }

        // ✅ هات آخر OTP بنفسك بدل populate
        const otp = await this.otpRepository.findOne({
            filter: { createdBy: user._id, otp: OtpEnum.ConfirmEmail },
            options: { sort: { createdAt: -1 } },
        });

        if (!otp) {
            throw new BadRequestException("OTP not found or expired");
        }

        const isMatch = await CompareHash(code, otp.code);
        if (!isMatch) {
            throw new BadRequestException("Invalid OTP code");
        }

        // ✅ تم التحقق
        user.confirmedAt = new Date();
        await user.save();
        await this.otpRepository.deleteOne({ filter: { _id: otp._id } });

        return "Done";
    }



}