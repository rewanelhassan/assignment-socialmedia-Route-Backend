import {z} from "zod"
import { createPostSchema, reactPostSchema, updatePostSchema  } from "../post.validation"

export type ICreatePost = z.infer<typeof createPostSchema.body>
export type IUpdatePost = z.infer<typeof updatePostSchema.body>
 
 