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
import { createPostSchema, reactPostSchema, updatePostSchema } from "./post.validation";
import { ICreatePost, IUpdatePost } from "./dto/post.dto";
import { paginationQuery, paginationQuerySchema } from "../../common/utils/general-validation";
import { commentRouter } from "../comment/comment.controller";
 

const postRouter = Router();
postRouter.use(":id/comment",commentRouter)
 
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
postRouter.patch(
 
  "/:id",
  auth,
  cloudUpload({
    folder: "post",
    maxSize: 5,
    StorageType: StorageTypeEnum.DISK,
    fileValidation: fileValidation.images,
  }).array("attachment",5),
  validation(updatePostSchema),
  async (req, res, next) => {
    const postId = req.params.id as string
    const body = req.body as IUpdatePost 
    const files = req.files as  Express.Multer.File[]
    const user = await postService.update(
      postId,
      body,
      req.user!,
      StorageTypeEnum.DISK,
      files,
    ); 
    return successResponse({ res, data: user });
  },
);
postRouter.patch(
 
  "/:id/react",
  auth,
  validation(reactPostSchema),
  async (req, res, next) => {
    const postId = req.params.id as string
    const post = await postService.reactPost(
      postId,
      req.user!,
    ); 
    return successResponse({ res, data: post });
  },
);



export default postRouter;
