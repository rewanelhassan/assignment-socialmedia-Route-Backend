import {z} from "zod"
import { loginSchema, signupSchema } from "../auth.validation"

export type ILogin = z.infer<typeof loginSchema.body>
export type ISignup = z.infer<typeof signupSchema.body>