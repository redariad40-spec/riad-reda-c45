import { diskStorage, memoryStorage } from "multer"
import type { Request } from "express"
import { BadRequestException } from "@nestjs/common"
import { MulterOptions } from "@nestjs/platform-express/multer/interfaces/multer-options.interface"
import { storageEnum } from "src/common/enums";
import { tmpdir } from "os";
import { randomUUID } from "crypto";

export const cloudFiledUpload = ({
    storageapproch = storageEnum.memory,
    validation = [],
    fileSize = 2
}: {
    storageapproch?: storageEnum;
    validation: string[];
    fileSize?: number;
}): MulterOptions => {
    return {
        storage: storageapproch === storageEnum.memory
            ? memoryStorage()
            : diskStorage({
                destination: tmpdir(),
                filename: function (
                    req: Request,
                    file: Express.Multer.File,
                    callback
                ) {
                    callback(null, `${randomUUID()}_${file.originalname}`)
                }
            }),

        fileFilter(req: Request, file: Express.Multer.File, callback: Function) {
            if (!validation.includes(file.mimetype)) {
                return callback(
                    new BadRequestException("validation format error")
                );
            }
            return callback(null, true);
        },
        limits: {
            fileSize: fileSize * 1024 * 1024,
        },
    };
};