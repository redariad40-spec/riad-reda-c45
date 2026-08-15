
import { InjectModel } from "@nestjs/mongoose";
import { DatabaseRepository } from "./database.repository";
import { Product, ProductDocument as TDocument } from "../model";
import { Injectable } from "@nestjs/common";
import { Model } from "mongoose";


@Injectable()

export class ProductRepository extends DatabaseRepository<TDocument> {
    constructor(@InjectModel(Product.name) protected override readonly model: Model<TDocument>) {
        super(model)
    }
}