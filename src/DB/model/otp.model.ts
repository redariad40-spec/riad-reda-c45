import { MongooseModule, Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { emailevent, GenerateHash, IOtp, OtpEnum } from "src/common";
import { log } from "util";


@Schema({ timestamps: true })

export class Otp implements IOtp {
    @Prop({ type: String, required: true })
    code: string;

    @Prop({ type: Date, required: true })
    expiredAt: Date;


    @Prop({ type: Types.ObjectId, ref: "User", required: true })
    createdBy: Types.ObjectId;

    @Prop({ type: String, enum: OtpEnum, required: true })
    otp: OtpEnum
}
export type OtpDocument = HydratedDocument<Otp>;

const otpSchema = SchemaFactory.createForClass(Otp);

otpSchema.index({ expiredAt: 1 }, { expireAfterSeconds: 0 });


otpSchema.pre("save", async function (this: OtpDocument & { wasNew: boolean; PlainOtp?: string }, next) {
    this.wasNew = this.isNew

    if (this.isModified("code")) {
        this.PlainOtp = this.code

        this.code = await GenerateHash(this.code)

    };
    next()
});

otpSchema.post("save", async function (doc, next) {

    const that = this as OtpDocument & { wasNew: boolean; PlainOtp?: string }
    await that.populate([{ path: "createdBy", select: "email" }]);

    console.log({
        email: (that.createdBy as any).email,
        wasNew: that.wasNew,
        otp: that.PlainOtp
    });

    if (that.wasNew && that.PlainOtp) {
        emailevent.emit(doc.otp, {
            to: (that.createdBy as any).email,
            otp: that.PlainOtp,
        });
    }

    next()
})

export const OtpModel = MongooseModule.forFeature([{ name: Otp.name, schema: otpSchema }])

