import { diskStorage } from "multer"
import { randomUUID } from "crypto"
import type { Request } from "express"
import path from "path"
import type { IMulter } from "src/common/interface"
import { existsSync, mkdirSync } from "fs"
import { BadRequestException } from "@nestjs/common"
import { MulterOptions } from "@nestjs/platform-express/multer/interfaces/multer-options.interface"

export const localFiledUpload = ({
    folder = 'public',
    validation = [],
    fileSize = 2
}: {
    folder?: string;
    validation: string[];
    fileSize?: number;
}): MulterOptions => {
    let bathepath = path.resolve(`./uploads/${folder}`)
    return {
        storage: diskStorage({
            destination(req: Request, file: Express.Multer.File, callback: Function) {
                const fullpath = bathepath
                if (!existsSync(fullpath)) {
                    mkdirSync(fullpath, { recursive: true })
                }
                callback(null, fullpath)
            },

            filename(req: Request, file: IMulter, callback: Function) {
                const filename = randomUUID() + ' ' + Date.now() + ' ' + file.originalname
                file.finalpath = bathepath + `/${filename}`
                callback(null, filename)
            },
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