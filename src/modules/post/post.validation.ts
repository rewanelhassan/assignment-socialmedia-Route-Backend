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
export const updatePostSchema = {
  body: z
    .strictObject({
      content: z.string().optional(),
      remove_attachment:z.array(z.string()).optional(),
      tags: z.array(z.string()).optional(),
      remove_tags: z.array(z.string()).optional(),
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
      if (val.remove_tags?.length) {
        const unique = [...new Set(val.tags)];
        if (unique.length !== val.remove_tags.length) {
          ctx.addIssue({
            path: ["tags"],
            code: "custom",
            message: "dublicated tags",
          });
        }

        for (let tag of val.remove_tags){
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
  params:z.strictObject({
    id:z.string().refine((val)=> Types.ObjectId.isValid(val),{
      path:["id"],
      message:"invalid id",
    }),

  })
};

export const reactPostSchema={
   params:z.strictObject({
    id:z.string().refine((val)=> Types.ObjectId.isValid(val),{
      path:["id"],
      message:"invalid id",
    }),

  })

}
