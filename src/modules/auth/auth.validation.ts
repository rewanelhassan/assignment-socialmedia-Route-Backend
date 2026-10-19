import  {z}  from "zod";
import { Role } from "../../common/enums";

 
 
export const loginSchema = 
{
body:z.strictObject({
  email: z.email({error: "invalid email"}),
  password: z.string(),
  FCM_Token:z.string().optional(),

}).superRefine((val,ctx)=>{
    if(val.email.length >= 50){
        ctx.addIssue({
            path:["email"],
            code:"custom",
            message:"too many chars"

        })
    }
}),
// params:z.object({
//     id:z.string()
// }),
}

export const signupSchema ={  
  body:loginSchema.body.safeExtend({
  username: z.string(),
  phone:z.string().optional(),
  // age: z.int().gte(18).optional(),
  // is_grad: z.coerce.boolean().optional(),
  // role: z.enum(Role),
  // skills: z.array(z.string()).length(5).optional()
})

}
   