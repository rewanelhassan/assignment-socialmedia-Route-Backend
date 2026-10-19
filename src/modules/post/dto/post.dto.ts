import {z} from "zod"
import { createPostSchema  } from "../post.validation"

export type ICreatePost = z.infer<typeof createPostSchema.body>
 