import {
  S3Client,
  ListBucketsCommand,
  PutObject$,
  PutObjectCommand,
  ObjectCannedACL,
} from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { randomUUID } from "node:crypto";
import { BadRequestException } from "../response";
import { StorageTypeEnum } from "../enums/storage";
import { createReadStream } from "node:fs";

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
  async uploadLargeFile({
    file,
    bucket = process.env.BUCKET_NAME as string,
    folder = "general",
    path = "",
    ACL = "private",
    contentType,
    StorageType,
    partSize = 5 
  }: {
    file: Express.Multer.File;
    bucket?: string;
    folder: string;
    path: string;
    ACL?: ObjectCannedACL;
    contentType?: string;
    StorageType: StorageTypeEnum;
     partSize?:number
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

      queueSize: 4,//كام طابور
      partSize: 1024 * 1024 * partSize,//حجم الchuckفي الطابور
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
}

const s3Service = new S3Service();
export default s3Service;
