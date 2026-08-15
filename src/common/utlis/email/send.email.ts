import nodemailer, { type Transporter } from "nodemailer";
import type Mail from "nodemailer/lib/mailer";

export const sendemail = async (data: Mail.Options): Promise<void> => {
  const transporter: Transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.APP_EMAIL,
      pass: process.env.APP_PASSWORD,
    },
  });

  const info = await transporter.sendMail({
    from: `"ROUTE ACADEMY" <${process.env.APP_EMAIL}>`,
    ...data,
  });

  console.log("Message sent: %s", info.messageId);
};
