import {z} from "zod"
import { createCommentSchema, updateCommentSchema } from "../comment.validation"

export type ICreateComment = z.infer<typeof createCommentSchema.body>
export type IUpdateComment = z.infer<typeof updateCommentSchema.body>
 
 