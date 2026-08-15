import { MongooseModule, Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types, UpdateQuery } from "mongoose";
import slugify from "slugify";
import { ICategory } from "src/common";

@Schema({ timestamps: true, strictQuery: true })
export class Category implements ICategory {
    @Prop({ type: String, required: true, unique: true, minlength: 2, maxlength: 25 })
    name: string;

    @Prop({ type: String, required: false, minlength: 2, maxlength: 50 })
    slug: string;

    @Prop({ type: String, required: true, minlength: 2, maxlength: 25 })
    slogan: string;

    @Prop({ type: String, required: false, minlength: 2, maxlength: 25 })
    description: string;

    @Prop({ type: String, required: true })
    image: string;

    @Prop({ type: String, required: true })
    assetFolderId: string;

    @Prop({ type: Date })
    freezedAt?: Date;

    @Prop({ type: Date })
    restoredAt?: Date;

    @Prop({ type: Types.ObjectId, ref: "User", required: true })
    createdBy: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "User" })
    updatedBy: Types.ObjectId;
}

export type CategoryDocument = HydratedDocument<Category>;

export const CategorySchema = SchemaFactory.createForClass(Category);

// ✅ Hook لتوليد slug من الاسم
CategorySchema.pre("save", function (next) {
    if (this.isModified("name")) {
        this.slug = slugify(this.name, { lower: true });
    }
    next();
});


CategorySchema.pre(['updateOne', 'findOneAndUpdate'], async function (next) {

    const update = this.getQuery() as UpdateQuery<CategoryDocument>;
    if (update.name) {
        this.setUpdate({ ...update, slug: slugify(update.name) })
    }
    const query = this.getQuery();
    if (query.paranoid === false) {
        this.setQuery({ ...query })
    } else {
        this.setQuery({ ...query, freezedAt: { $exists: false } })
    }
    next();
});

CategorySchema.pre(["findOne", "find"], function (next) {
    const query = this.getQuery();
    if (query.paranoid === false) {
        this.setQuery({ ...query })
    } else {
        this.setQuery({ ...query, freezedAt: { $exists: false } })
    }
    next()
})
export const CategoryModel = MongooseModule.forFeature([{ name: Category.name, schema: CategorySchema }])
