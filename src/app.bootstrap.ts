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
import cors from "cors";
import notificationService from "./common/services/notification.service";
import postRouter from "./modules/post/post.controller";
import { schema } from "./modules/graphql/schema.gql";
import { createHandler } from "graphql-http/lib/use/express";

const bootstrap = async () => {
  config();
  const app: Express = express();
  app.use(express.json());
  app.use(cors());

  // await DBconnection();
  // await redisService.connection();

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
          download: false,
        });
        res.status(200).json({ result });
      } catch (error) {
        console.log({ error });
      }
    },
  );

  // app.post("/", async (req: Request, res: Response, next: NextFunction) => {
  //   console.log({token :req.body });

  //   await notificationService.sendNotification({
  //     token: req.body.token,
  //     title: "test",
  //     data: "hello notification",
  //   });
  //   res.status(200).json({
  //     message: "hello TS",
  //   });
  // });

  app.get("/", (req: Request, res: Response, next: NextFunction): void => {
    res.status(200).json({
      message: "hello TS",
    });
  });

  app.use("/auth", authRouter);
  app.use("/user", userRouter);
  app.use("/post", postRouter);

  
  app.all("/graphql",createHandler({schema}) )
  app.use(globalError);

  app.listen(8000, () => {
    console.log("sever is working.......");
  });
  console.log("app is running");
};

export default bootstrap;
