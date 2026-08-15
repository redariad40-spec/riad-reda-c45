import { MongooseModule, Prop, Schema, SchemaFactory, Virtual } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { GenderEnum, ProviderEnum, RoleEnum } from "src/common/enums";
import { GenerateHash, IUsers } from "src/common";
import { OtpDocument } from "./otp.model";
import { string } from "zod";


@Schema({
    strictQuery: true,
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
})



export class User implements IUsers {

    @Prop({
        type: String,
        required: true,
        minlength: 2,
        maxlength: 25,
        trim: true,
    })
    firstname: string;

    @Prop({
        type: String,
        required: true,
        minlength: 2,
        maxlength: 25,
        trim: true,
    })
    lastname: string;


    @Virtual({
        get: function (this: User) {
            return this.firstname + " " + this.lastname
        },
        set: function (value: string) {
            const [firstname, lastname] = value.split(" ");
            this.set({ firstname, lastname });
        }
    })
    username: string;

    @Prop({
        type: String,
        unique: true,
        required: true,

    })
    email: string;

    @Prop({
        type: Date,
    })
    confirmemail: Date;



    @Prop({
        type: String,
        required: function (this: User) {
            return this.provider === ProviderEnum.GOOGLE ? false : true;
        }

    })
    password: string;

    @Prop({
        type: String,
        enum: ProviderEnum,
        default: ProviderEnum.SYSTEM
    })
    provider: ProviderEnum;


    @Prop({
        type: String,
        enum: GenderEnum,
        default: GenderEnum.male
    })
    gender: GenderEnum;

    @Prop({
        type: String,
        enum: RoleEnum,
        default: RoleEnum.user
    })
    role: RoleEnum;


    @Prop({
        type: String,
       
    })
    profilePicture: string;

    @Prop({
        type: Date,
        required: false,

    })
    confirmedAt: Date;


    @Prop({
        type: Date,
        required: false,

    })
    ChangeCredentialsTime: Date;

    @Virtual()
    otp: OtpDocument[]

}

const userSchema = SchemaFactory.createForClass(User);
export type UserDocument = HydratedDocument<User>;

userSchema.virtual("otp", {
    localField: "_id",
    foreignField: "createdBy",
    ref: "Otp"
})
//HOOKS generate password
userSchema.pre("save", async function (next) {
    if (this.isModified('password')) {
        this.password = await GenerateHash(this.password)
        next();
    }

});
export const UserModel = MongooseModule.forFeature([{ name: User.name, schema: userSchema }])
