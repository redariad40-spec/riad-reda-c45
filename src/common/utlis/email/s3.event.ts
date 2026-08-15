import { EventEmitter } from "node:events";
import { deleteFile, getFile } from "../multer/s3.config";
import { UserRepository } from "../../DB/repository/User.repository";
import { UserModel } from "../../DB/model/User.model";
export const s3Event = new EventEmitter({});


s3Event.on("trackprofileimageUpload", (data) => {
    console.log({ data });
  
    setTimeout(async () => {
      const userModel = new UserRepository(UserModel);
  
      try {
        // تأكد من وجود الصورة الجديدة
        await getFile({ Key: data.key });
  
        // شيل الـ tempProfileImage بعد الرفع
        await userModel.updateOne({
          filter: { _id: data.userId },
          update: {
            $unset: { temprofileImage: 1 },
          },
        });
  
        // امسح الصورة القديمة
        await deleteFile({ Key: data.oldKey });
  
        console.log(`DONE💯`);
      } catch (error: any) {
        console.log(error);
  
        // في حالة الصورة الجديدة مش موجودة (NoSuchKey)
        if (error.code === "NoSuchKey") {
          await userModel.updateOne({
            filter: { _id: data.userId },
            update: {
              profileImage: data.oldKey,
              $unset: { temprofileImage: 1 },
            },
          });
        }
      }
    }, data.expiresIn || Number(process.env.AWS_PRE_SIGNED_URL_IN_SECOUNDS) * 1000);
  });
  
