import { DeleteObjectCommand, DeleteObjectCommandOutput, DeleteObjectsCommand, DeleteObjectsCommandOutput, GetObjectCommand, GetObjectCommandOutput, ListObjectsV2Command, ObjectCannedACL, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { BadRequestException, Injectable } from "@nestjs/common";
import { storageEnum } from "../enums";
import { randomUUID } from "crypto";
import { createReadStream } from "fs";
import { Upload } from "@aws-sdk/lib-storage";



@Injectable()
export class S3Service {
    private s3Client: S3Client;
    constructor() {
        this.s3Client = new S3Client({
            region: process.env.AWS_REGION as string,
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
            },
        });
    }

    uploadFile = async ({
        store = storageEnum.memory,
        Bucket = process.env.AWS_BUCKET_NAME as string,
        path = "general",
        ACL = "private" as ObjectCannedACL,
        file,
    }: {
        store?: storageEnum;
        Bucket?: string;
        path?: string | undefined;
        ACL?: ObjectCannedACL;
        file: Express.Multer.File;
    }): Promise<string> => {

        if (!file) {
            throw new BadRequestException("No file provided");
        }

        const Key = `${process.env.APPLICATION_NAME}/${path}/${randomUUID()}_${file.originalname}`;

        const command = new PutObjectCommand({
            Bucket,
            Key,
            ACL,
            Body: store === storageEnum.memory ? file.buffer : createReadStream(file.path),
            ContentType: file.mimetype,
        });


        await this.s3Client.send(command);

        if (!Key) {
            throw new BadRequestException("Fail to upload");
        }

        return Key;
    };

    uploadLargeFile = async ({
        store = storageEnum.disk,
        Bucket = process.env.AWS_BUCKET_NAME as string,
        path = "general",
        ACL = "private" as ObjectCannedACL,
        file,
    }: {
        store?: storageEnum;
        Bucket?: string;
        path?: string | undefined;
        ACL?: ObjectCannedACL;
        file: Express.Multer.File;
    }): Promise<string> => {
        const upload = new Upload({
            client: await this.s3Client,
            params: {
                Bucket,
                Key: `${process.env.APPLICATION_NAME}/${path}/${randomUUID()}_${file.originalname}`,
                ACL,
                Body: store === storageEnum.memory ? file.buffer : createReadStream(file.path),
                ContentType: file.mimetype,
            }
        })
        upload.on("httpUploadProgress", (progress) => {
            console.log(`File upload progress is ::: `, progress);
        });
        const { Key } = await upload.done()
        if (!Key) {
            throw new BadRequestException("fail to key")
        }
        return Key;
    };

    uploadFiles = async ({
        store = storageEnum.memory,
        Bucket = process.env.AWS_BUCKET_NAME as string,
        path = "general",
        ACL = "private" as ObjectCannedACL,
        files,
        useLarge = false,
    }: {
        store?: storageEnum;
        Bucket?: string;
        path?: string | undefined;
        ACL?: ObjectCannedACL;
        files: Express.Multer.File[]; // 👈 لازم ييجي من req.files (array of images)
        useLarge?: boolean;
    }): Promise<string[]> => {
        if (!files || files.length === 0) {
            throw new BadRequestException("No files provided");
        }

        // ✅ رفع كل فايل ورجوع Array من الـ URLs
        const urls = await Promise.all(
            files.map((file) =>
                useLarge
                    ? this.uploadLargeFile({ store, Bucket, path, ACL, file })
                    : this.uploadFile({ store, Bucket, path, ACL, file })
            )
        );

        return urls;
    };


    createPresignedUploadUrl = async ({
        Bucket = process.env.AWS_BUCKET_NAME as string,
        path = "general",
        expiresIn = Number(process.env.AWS_PRE_SIGNED_URL_IN_SECOUNDS) * 1000,
        originalname,
        ContentType,
    }: {
        Bucket?: string;
        path?: string;
        expiresIn: number;
        originalname?: string; // خلتها اختيارية
        ContentType: string;
    }): Promise<{ url: string; key: string }> => {
        const safeOriginalname =
            originalname && originalname.trim() !== ""
                ? originalname
                : `file-${Date.now()}.jpg`; // fallback باسم + .jpg

        const command = new PutObjectCommand({
            Bucket,
            Key: `${process.env.APPLICATION_NAME}/${path}/${randomUUID()}_${safeOriginalname}`,
            ContentType,
        });

        const url = await getSignedUrl(await this.s3Client, command, { expiresIn });

        if (!url || !command?.input?.Key) {
            throw new BadRequestException(
                `Failed to create pre-signed url: url=${url}, key=${command?.input?.Key}`
            );
        }

        return { url, key: command.input.Key };
    };


    getFile = async ({
        Bucket = process.env.AWS_BUCKET_NAME as string,
        Key,
    }: {
        Bucket?: string;
        Key: string;
    }): Promise<GetObjectCommandOutput> => {

        const command = new GetObjectCommand({
            Bucket,
            Key,
        });
        return await this.s3Client.send(command);
    };


    createGetPresignedLink = async ({
        Bucket = process.env.AWS_BUCKET_NAME as string,
        Key,
        expiresIn = 120,
        DownloadName = "dummy",
        download = "false",
    }: {
        Bucket?: string;
        Key: string;
        expiresIn?: number;
        DownloadName?: string;
        download?: string;
    }): Promise<string> => {

        const command = new GetObjectCommand({
            Bucket,
            Key, // ✅ استخدم اللي جاي من البراميتر
            ResponseContentDisposition:
                download === "true"
                    ? `attachment; filename="${DownloadName || Key.split("/").pop()}"`
                    : undefined,
        });

        const url = await getSignedUrl(await this.s3Client, command, { expiresIn });

        if (!url) throw new BadRequestException("fail to create pre-signed url");

        return url;
    }


    deleteFile = async ({
        Bucket = process.env.AWS_BUCKET_NAME as string,
        Key,
    }: {
        Bucket?: string;
        Key: string;
    }): Promise<DeleteObjectCommandOutput> => {
        const command = new DeleteObjectCommand({
            Bucket,
            Key,
        });
        return await this.s3Client.send(command);
    };

    deleteFiles = async ({
        Bucket = process.env.AWS_BUCKET_NAME as string,
        urls,
        Quiet = false,
    }: {
        Bucket?: string;
        urls: string[];
        Quiet?: boolean;
    }): Promise<DeleteObjectsCommandOutput> => {

        const Objects = urls.map((url) => {
            return { Key: url }
        })
        console.log(Objects);

        const command = new DeleteObjectsCommand({
            Bucket,
            Delete: {
                Objects,
                Quiet,
            },
        });
        return await this.s3Client.send(command);
    };
    listFiles = async ({
        Bucket = process.env.AWS_BUCKET_NAME as string,
        path,
    }: {
        Bucket?: string;
        path: string;
    }) => {
        const command = new ListObjectsV2Command({
            Bucket,
            Prefix: `${process.env.APPLICATION_NAME}/${path}`,
        });

        return await this.s3Client.send(command);

    };
    deleteFolderCByPrefix = async ({
        Bucket = process.env.AWS_BUCKET_NAME as string,
        path,
        Quiet = false,
    }: {
        Bucket?: string;
        path: string;
        Quiet?: boolean;
    }): Promise<DeleteObjectsCommandOutput> => {
        const filelist = await this.listFiles({ Bucket, path })

        if (!filelist?.Contents?.length) {
            throw new BadRequestException("empty list file");
        }
        const urls: string[] = filelist.Contents.map((file) => {
            return file.Key as string;
        })
        return await this.deleteFiles({ urls, Bucket, Quiet });
    };

}