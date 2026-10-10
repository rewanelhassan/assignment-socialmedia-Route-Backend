import {
  S3Client,
  ListBucketsCommand,
  PutObject$,
  PutObjectCommand,
  ObjectCannedACL,
  GetObjectCommand,
  DeleteObjectsCommand,
  DeleteObjectCommand
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Upload } from "@aws-sdk/lib-storage";
import { randomUUID } from "node:crypto";
import { BadRequestException } from "../response";
import { StorageTypeEnum } from "../enums/storage";
import { createReadStream } from "node:fs";
import { boolean } from "zod";

class S3Service {
  private client: S3Client;
  constructor() {
    this.client = new S3Client({
      region: process.env.BUCKET_REGION as string,
      credentials: {
        accessKeyId: process.env.ACCESS_KEY as string,
        secretAccessKey: process.env.SECRET_KEY as string,
      },
    });
  }

  async uploadFile({
    file,
    bucket = process.env.BUCKET_NAME as string,
    folder = "general",
    path = "",
    ACL = "private",
    contentType,
    StorageType,
  }: {
    file: Express.Multer.File;
    bucket?: string;
    folder: string;
    path: string;
    ACL?: ObjectCannedACL;
    contentType?: string;
    StorageType: StorageTypeEnum;
  }) {
    const uploadOptions = {
      Bucket: bucket,
      Key: `social_media/${folder}/${path}/${randomUUID()}-${file.originalname}`,
      Body:
        StorageType == StorageTypeEnum.MEMORY
          ? file.buffer
          : createReadStream(file.path),
      ACL,
      ContentType: file.mimetype || contentType,
    };
    const command = new PutObjectCommand(uploadOptions);
    if (!command.input.Key) {
      throw new BadRequestException("faild to upload");
    }

    const res = await this.client.send(command);
    if (!res.ETag) {
      throw new BadRequestException("faild to upload");
    }

    return command.input.Key;
  }
  async uploadFiles({
    files,
    bucket = process.env.BUCKET_NAME as string,
    folder = "general",
    path = "",
    ACL = "private",
    contentType,
    StorageType,
  }: {
    files: Express.Multer.File[];
    bucket?: string;
    folder: string;
    path: string;
    ACL?: ObjectCannedACL;
    contentType?: string;
    StorageType: StorageTypeEnum;
  }) {
    const urls = await Promise.all([
      files.map(async (file) => {
        const uploadedFile = await this.uploadFile({
          file,
          bucket,
          folder,
          path,
          StorageType,
        });
        return uploadedFile;
      }),
    ]);
    return urls;
  }
  async uploadLargeFile({
    file,
    bucket = process.env.BUCKET_NAME as string,
    folder = "general",
    path = "",
    ACL = "private",
    contentType,
    StorageType,
    partSize = 5,
  }: {
    file: Express.Multer.File;
    bucket?: string;
    folder: string;
    path: string;
    ACL?: ObjectCannedACL;
    contentType?: string;
    StorageType: StorageTypeEnum;
    partSize?: number;
  }) {
    const parallelUploads3 = new Upload({
      client: this.client,
      params: {
        Bucket: bucket,
        Key: `social_media/${folder}/${path}/${randomUUID()}-${file.originalname}`,
        Body:
          StorageType == StorageTypeEnum.MEMORY
            ? file.buffer
            : createReadStream(file.path),
        ACL,
        ContentType: file.mimetype || contentType,
      },

      queueSize: 4, //كام طابور
      partSize: 1024 * 1024 * partSize, //حجم الchuckفي الطابور
      leavePartsOnError: false,
    });

    parallelUploads3.on("httpUploadProgress", (progress) => {
      console.log(progress);
    });

    const result = await parallelUploads3.done();
    if (!result.Location) {
      throw new BadRequestException("failed to upload");
    }

    return result.Key;
  }
  async uploadPresignedFile({
    fileName,
    bucket = process.env.BUCKET_NAME as string,
    folder = "general",
    path = "",
    contentType,
  }: {
    fileName: string;
    bucket?: string;
    folder: string;
    path: string;
    contentType?: string;
  }) {
    const uploadOptions = {
      Bucket: bucket,
      Key: `social_media/${folder}/${path}/${randomUUID()}-${fileName}`,
      contentType: "image/png",
    };
    const command = new PutObjectCommand(uploadOptions);
    if (!command.input.Key) {
      throw new BadRequestException("faild to upload");
    }
    const presigned = await getSignedUrl(this.client, command, {
      expiresIn: 60,
    });

    return { presigned, key: command.input.Key };
  }

  async getFile({
    bucket = process.env.BUCKET_NAME as string,
    fileName,
  }: {
    bucket?: string;
    fileName: string;
  }) {
    const command = new GetObjectCommand({
      Key: fileName,
      Bucket: bucket,
    });

    const result = await this.client.send(command);
    return result;
  }
  async getPresignedFile({ // override disadventage
    bucket = process.env.BUCKET_NAME as string,
    fileName,
    download = false,
  }: {
    bucket?: string;
    fileName: string;
    download?: boolean;
  }) {
    const command = new GetObjectCommand({
      Key: fileName,
      Bucket: bucket,
      ResponseContentDisposition:
        download == true
          ? `attachment;filename= ${fileName.split("/").pop()}`
          : undefined,
    });

    const presigned = await getSignedUrl(this.client, command, {
      expiresIn: 60,
    });
    return presigned;
  }
  async deletFile({
    bucket = process.env.BUCKET_NAME as string,
    fileName,
  }: {
    bucket?: string;
    fileName: string;
  }) {
    const command = new DeleteObjectCommand({
      Key: fileName,
      Bucket: bucket,
    });

    const result = await this.client.send(command);
    return result;
  }
  async deletFiles({
    bucket = process.env.BUCKET_NAME as string,
    files,
  }: {
    bucket?: string;
    files: string[];
  }) {
    const command = new DeleteObjectsCommand({
      Bucket: bucket,
      Delete: {
        Objects: files.map((e) => ({ Key: e })),
      },
    });

    const result = await this.client.send(command);
    return result;
  }
}

const s3Service = new S3Service();
export default s3Service;
