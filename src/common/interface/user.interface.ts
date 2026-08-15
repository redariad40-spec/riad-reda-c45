import { Types } from "mongoose";
import { ProviderEnum, GenderEnum, RoleEnum } from "src/common/enums";
import { OtpDocument } from "src/DB"; 

export interface IUsers {
    _id?: Types.ObjectId;

    firstname: string;
    lastname: string;

    username?: string;

    email: string;
    confirmemail?: Date;

    password?: string;

    provider?: ProviderEnum;
    gender?: GenderEnum;
    role?: RoleEnum;

    profilePicture?: string;

    confirmedAt?: Date;
    ChangeCredentialsTime?: Date;

    otp?: OtpDocument[];

    createdAt?: Date;
    updatedAt?: Date;
}
