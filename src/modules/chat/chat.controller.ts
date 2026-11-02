import { Response, Router, Request, NextFunction } from "express";
import { chatService } from "./chat.service";
import { successResponse } from "../../common/response";
import { auth } from "../../middlewars/auth.middleware";
import { UserHydrated } from "../../DB/models/user.model";

export const chatRouter = Router({ mergeParams: true });

chatRouter.get(
  "/",
  auth,

  async (req: Request, res: Response, next: NextFunction) => {
    const user = await chatService.getUserChat(
       req.query as any,
        req.params.userId as string,
     
      req.user! as UserHydrated,
    );
    successResponse({
      res,
      message: "Done",
      data: user,
    });
  },
);


chatRouter.post(
  "/group",
  auth,

  async (req: Request, res: Response, next: NextFunction) => {
    const user = await chatService.createGroup(
       req.body ,
      req.user! as UserHydrated,
    );
    successResponse({
      res,
      message: "Done",
      data: user,
    });
  },
);


chatRouter.get(
  "/group/:id",
  auth,

  async (req: Request, res: Response, next: NextFunction) => {
    const user = await chatService.getGroupChat(
       req.params.id as string,
       req.query as any 
    );
    successResponse({
      res,
      message: "Done",
      data: user,
    });
  },
);