import multer from "multer";
import path from "path";
import fs from "fs";
import { randomUUID } from "crypto";
import { Request } from "express";
import { StorageTypeEnum } from "../enums/storage";

export const fileValidation = {
  images: ["image/png", "image/jpg", "image/jpeg"],
  videos: ["video/mp4"],
};

export const cloudUpload = ({
  folder = "",
  StorageType = StorageTypeEnum.MEMORY,
  maxSize = 5,
  fileValidation = [],
}: {
  folder?: string;
  StorageType: StorageTypeEnum;
  maxSize?: number;
  fileValidation: string[];
}) => {
  return multer({
    storage:
      StorageType === StorageTypeEnum.MEMORY
        ? multer.memoryStorage()
        : multer.diskStorage({
            destination: function (
              req: Request,
              file: Express.Multer.File,
              cb,
            ) {
              const filePath = path.resolve(`./uploads/${folder}`);
              if (!fs.existsSync(filePath)) {
                fs.mkdirSync(filePath, {
                  recursive: true, //اعمل كل الفايلات اللي مش موجوده
                });
              }
              cb(null, filePath);
            },
            filename: function (
              req: Request,
              file: Express.Multer.File & { finalPath: string },
              cb,
            ) {
              const fileName = `${randomUUID()}-${file.originalname}`;
              file.finalPath = `/uploads/${folder}/${fileName}`;
              cb(null, fileName);
            },
          }),
    limits: {
      fileSize: 1024 * 1024 * maxSize,
    },
    fileFilter: function (
      req: Request,
      file: Express.Multer.File,
      cb: (error?: Error | null, accepFile?: boolean) => void,
    ) {
      if (!fileValidation.includes(file.mimetype)) {
        return cb(new Error("invalid file"), false);
      }
      return cb(null, true);
    },
  });
};
