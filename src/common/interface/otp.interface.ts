import { Types } from "mongoose";
import { OtpEnum } from "src/common/enums"; // عدل المسار حسب مكان enum عندك
import { IUsers } from "./user.interface";

export interface IOtp {
  _id?: Types.ObjectId;

  code: string;
  expiredAt: Date;

  createdBy: Types.ObjectId|IUsers; 

  otp: OtpEnum; 

  createdAt?: Date;
  updatedAt?: Date;
}
