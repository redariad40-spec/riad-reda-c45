import { InjectModel } from "@nestjs/mongoose";
import { DatabaseRepository } from "./database.repository";
import { Brand, BrandDocument as TDocument } from "../model";
import { Injectable } from "@nestjs/common";
import { Model } from "mongoose";


@Injectable()

export class BrandRepository extends DatabaseRepository<TDocument> {
    constructor(@InjectModel(Brand.name) protected override readonly model: Model<TDocument>) {
        super(model)
    }
}