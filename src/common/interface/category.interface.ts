import { Types } from "mongoose";
import { IUsers } from "./user.interface";
import { IBrand } from "./brand.interface";

export interface ICategory {
    _id?: Types.ObjectId;

    name: string;
    slug: string;
    slogan: string;
    image: string;
    description?: string;
    assetFolderId: string;


    brands?: Types.ObjectId[] | IBrand[]

    createdBy: Types.ObjectId | IUsers;
    updatedBy: Types.ObjectId | IUsers;


    freezedAt?: Date;
    restoredAt?: Date;




    createdAt?: Date;
    updatedAt?: Date;
}
