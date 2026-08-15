import { InjectModel } from "@nestjs/mongoose";
import { DatabaseRepository } from "./database.repository";
import { Category, CategoryDocument  as TDocument } from "../model";
import { Injectable } from "@nestjs/common";
import { Model } from "mongoose";


@Injectable()

export class CategoryRepository extends DatabaseRepository<TDocument> {
    constructor(@InjectModel(Category.name) protected override readonly model: Model<TDocument>) {
        super(model)
    }
}