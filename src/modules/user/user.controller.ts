import { Router, Request, Response, NextFunction } from "express";
import { BadRequestException, successResponse } from "../../common/response";
import {
  auth,
  authorization,
  IAuthRequest,
} from "../../middlewars/auth.middleware";
import { Role } from "../../common/enums";
import userService from "./user.service";
import { HydratedDocument } from "mongoose";
import { IUser } from "../../common/interfaces/user.interface";
import {  fileValidation } from "../../common/utils/multer";
import { cloudUpload  } from "../../common/utils/cloud-multer";
import { validation } from "../../middlewars/validation.middleware";
import { updateUserImage } from "./user.validation";
import { StorageTypeEnum } from "../../common/enums/storage";

const userRouter = Router();

userRouter.get(
  "/",
  auth,
  authorization(Role.USER),
  (req: IAuthRequest, res: Response, next: NextFunction) => {
    const user = userService.profile(req.user as HydratedDocument<IUser>)
  return successResponse({ res, status: 200, data: user });
 
  },
);
userRouter.patch("/logout", auth, async (req, res, next) => {
  const user = await userService.logOut(
    (req.user as HydratedDocument<IUser>).id,
    req.body.flag,
    {
      jti: req.decoded?.jti as string,
      iat: req.decoded?.iat as number,
    }
  );
  return successResponse({ res, status: 200, data: user });
});

userRouter.put(
  "/",
    auth,
  cloudUpload({
    folder: "user/profile",
    maxSize: 5,
    StorageType:StorageTypeEnum.MEMORY,
    fileValidation: fileValidation.images,
  }).single("profile"),
    validation(updateUserImage),
  async (req, res, next) => {
    const file = await userService.updateUserProfile(req.file!,req.user!, StorageTypeEnum.MEMORY);//مش شغال عشان الaws 
    return successResponse({ res, data: file });
  },
);

export default userRouter;
