import { MongooseModule, Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { IProduct } from "src/common";


@Schema({ timestamps: true })


export class Product implements IProduct {
  @Prop({ type: String, required: true, unique: true, minlength: 2, maxlength: 25 })
  name: string;

  @Prop({ type: String, required: false, minlength: 2, maxlength: 50 })
  slug: string;

  @Prop({ type: String, required: true, minlength: 2, maxlength: 25 })
  slogan: string;

  @Prop({ type: String, required: true })
  image: string;

  @Prop({ type: Types.ObjectId, ref: "User", required: true })
  createdBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "User" })
  updatedBy: Types.ObjectId;
}

export type ProductDocument = HydratedDocument<Product>;

export const productSchema = SchemaFactory.createForClass(Product);


export const ProductModel = MongooseModule.forFeature([{ name: Product.name, schema: productSchema }])
