import {z}from "zod"
import { fileValidation } from "../../common/utils/multer"

export const updateUserImage ={
    file: z.object({
    fieldname: z.string() ,
    originalname: z.string() ,
    encoding: z.string() ,
    mimetype: z.string(),
    finalPath: z.string() ,
    path: z.string() ,
    destination: z.string() ,
    filename: z.string() ,
    size: z.number() ,
  }),
} 