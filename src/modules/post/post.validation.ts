import { z } from "zod";
import { generalValidation } from "../../common/utils/general-validation";
import { AvailableEnum } from "../../common/enums/available";
import { Types } from "mongoose";

export const createPostSchema = {
  body: z
    .strictObject({
      content: z.string().optional(),
      tags: z.array(z.string()).optional(),
      available: z
        .enum(Object.values(AvailableEnum))
        .default(AvailableEnum.PUBLIC),
    })
    .superRefine((val, ctx) => {
      if (val.tags?.length) {
        const unique = [...new Set(val.tags)];
        if (unique.length !== val.tags.length) {
          ctx.addIssue({
            path: ["tags"],
            code: "custom",
            message: "dublicated tags",
          });
        }

        for (let tag of val.tags){
          if(!Types.ObjectId.isValid(tag)){
             ctx.addIssue({
            path: ["tags"],
            code: "custom",
            message: "tags must be object id",
          });

          }
        }
      }
    }),
  files: z.array(generalValidation.file).optional(),
};
