import { InjectModel } from "@nestjs/mongoose";
import { DatabaseRepository } from "./database.repository";
import { Otp,   OtpDocument as TDocument } from "../model";
import { Injectable } from "@nestjs/common";
import { Model } from "mongoose";


@Injectable()

export class OtpRepository extends DatabaseRepository<TDocument> {
    constructor(@InjectModel(Otp.name) protected override readonly model: Model<TDocument>) {
        super(model)
    }
}