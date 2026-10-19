import { Router, Request, Response, NextFunction } from "express";
import { BadRequestException, successResponse } from "../../common/response";
import {
  auth,
} from "../../middlewars/auth.middleware";
 
 
import { fileValidation } from "../../common/utils/multer";
import { cloudUpload } from "../../common/utils/cloud-multer";
import { validation } from "../../middlewars/validation.middleware";
 
import { StorageTypeEnum } from "../../common/enums/storage";
import { postService } from "./post.service";
import { createPostSchema } from "./post.validation";
import { ICreatePost } from "./dto/post.dto";
import { paginationQuery, paginationQuerySchema } from "../../common/utils/general-validation";
 

const postRouter = Router();
 
postRouter.post(
 
  "/",
  auth,
  cloudUpload({
    folder: "post",
    maxSize: 5,
    StorageType: StorageTypeEnum.DISK,
    fileValidation: fileValidation.images,
  }).array("attachment",5),
  validation(createPostSchema),
  async (req, res, next) => {
    const body = req.body as ICreatePost 
    const files = req.files as  Express.Multer.File[]
    const user = await postService.create(
      body!,
      files,
      StorageTypeEnum.DISK,
      req.user!,
    ); 
    return successResponse({ res, data: user });
  },
);
postRouter.get(
 
  "/",
  auth,
  validation(paginationQuerySchema),
  async (req, res, next) => {
    const query = req.query as paginationQuery
    const posts = await postService.find(
      query,
      req.user!,
    ); 
    return successResponse({ res, data: posts });
  },
);


export default postRouter;
