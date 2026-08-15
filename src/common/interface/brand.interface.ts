import { Types } from "mongoose";
import { IUsers } from "./user.interface";

export interface IBrand {
    _id?: Types.ObjectId;

    name: string;
    slug: string;
    slogan: string;
    image: string;

    createdBy: Types.ObjectId | IUsers;
    updatedBy: Types.ObjectId | IUsers;


    freezedAt?: Date;
    restoredAt?: Date;




    createdAt?: Date;
    updatedAt?: Date;
}
