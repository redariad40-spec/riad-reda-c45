import { EventEmitter } from "node:events";
import type Mail from "nodemailer/lib/mailer";
import { sendemail } from "./send.email";
import { VerifyEmailTemplate } from "./verify.email.template";
import { OtpEnum } from "src/common/enums";

export const emailevent = new EventEmitter();
interface IEmail extends Mail.Options {
    otp: number,
}

emailevent.on(OtpEnum.ConfirmEmail, async (data: IEmail) => {
    try {
        data.subject = OtpEnum.ConfirmEmail;
        data.html = VerifyEmailTemplate({ otp: data.otp, title: data.subject })
        await sendemail(data);
        console.log("✅ Email sent successfully");
    } catch (error) {
        console.log("❌ Failed to send email", error);
    }
});

emailevent.on(OtpEnum.RestPassword, async (data: IEmail) => {
    try {
        data.subject = OtpEnum.RestPassword;
        data.html = VerifyEmailTemplate({ otp: data.otp, title: data.subject })
        await sendemail(data);
        console.log("✅ Email sent successfully");
    } catch (error) {
        console.log("❌ Failed to send email", error);
    }
});
