import { Controller, Get, Patch,  UploadedFile, UploadedFiles, UseInterceptors } from "@nestjs/common";
import { UserService } from "./user.service";
import { IResponse, RoleEnum, storageEnum, successResponse, User } from "src/common";
import { Auth } from "src/common";
import type { UserDocument } from "src/DB";
import { FileInterceptor, FilesInterceptor } from "@nestjs/platform-express";
import { localFiledUpload } from "src/common/utlis/multer/local.multer.options";
import type { IMulter } from "../../common/interface/multer.interface";
import { cloudFiledUpload, FileValidation } from "src/common/utlis/multer";
import { ProfileResponse } from "./entities/user.entities";


@Controller('user')

export class UserController {
    constructor(private readonly userService: UserService) { }

    @Auth([RoleEnum.admin, RoleEnum.user])
    @Get()
    profile(@User() user: UserDocument): { message: string } {
        console.log({ user });

        return { message: "done" }
    }




    @Auth([RoleEnum.admin, RoleEnum.user])
    @UseInterceptors(
        FileInterceptor(
            'image',
            cloudFiledUpload(
                {
                    storageapproch: storageEnum.disk,
                    validation: FileValidation.image,
                    fileSize: 2
                })))
    @Patch('profile-image')

    async profileimage(
        @User() user: UserDocument,
        @UploadedFile() file: Express.Multer.File

    ): Promise<IResponse<ProfileResponse>> {

        const profile = await this.userService.profileimage(file, user);

        return successResponse<ProfileResponse>({ data: { profile } })
    }


    @Auth([RoleEnum.admin, RoleEnum.user])
    @UseInterceptors(
        FilesInterceptor(
            'images',
            2,
            localFiledUpload(
                {
                    folder: "user",
                    validation: FileValidation.image,
                    fileSize: 2
                })))
    @Patch('profile-cover-image')
    coverimage(@UploadedFiles() files: Array<IMulter>) {
        console.log({ files });
        return { message: 'done', files }
    }

}
