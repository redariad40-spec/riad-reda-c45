import { Injectable } from "@nestjs/common";
import { S3Service } from "src/common/service/s3.service";
import { UserDocument } from "src/DB";

@Injectable()
export class UserService {
    constructor(private readonly s3Service: S3Service) { }

    profile() {
        return "Done";
    }


    async profileimage(
        file: Express.Multer.File,
        user: UserDocument
    ): Promise<UserDocument> {
        user.profilePicture = await this.s3Service.uploadFile({ file, path: `user/${user._id.toString()}` })
        await user.save();
        return user;

    }
}