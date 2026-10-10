import express, { Request, Response, NextFunction } from "express";
import { type Express } from "express";
import { authRouter } from "./modules";
import { userRouter } from "./modules";
import { globalError } from "./common/response";
import { config } from "dotenv";
import { DBconnection } from "./DB/connection";
import redisService from "./common/services/redis.service";
import s3Service from "./common/services/s3.service";
import { pipeline } from "node:stream/promises";

const bootstrap = async () => {
  config();
  const app: Express = express();
  app.use(express.json());

  await DBconnection();
  await redisService.connection();

  app.use(
    "/uploads/*path",
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { download, filename } = req.query;
        const path = (req.params.path as string[]).join("/");
        const result = await s3Service.getFile({
          fileName: path,
        });
        res.setHeader(
          "content-type",
          result.ContentType || "application/octet-stream",
        );
        if (Boolean(download) && filename) {
          res.setHeader(
            "content-disposition",
            `attachment;filename= ${path.split("/").pop()}`,
          );
        }

        await pipeline(result.Body as NodeJS.ReadableStream, res);
      } catch (error) {
        console.log({ error });
      }
    },
  );

  app.use(
    "/presigned/uploads/*path",
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const path = (req.params.path as string[]).join("/");
        const result = await s3Service.getPresignedFile({
          fileName: path,
          download:false,
        });
        res.status(200).json({ result });
      } catch (error) {
        console.log({ error });
      }
    },
  );

  app.get("/", (req: Request, res: Response, next: NextFunction): void => {
    res.status(200).json({
      message: "hello TS",
    });
  });

  app.use("/auth", authRouter);
  app.use("/user", userRouter);
  app.use(globalError);

  app.listen(8000, () => {
    console.log("sever is working.......");
  });
  console.log("app is running");
};

export default bootstrap;
