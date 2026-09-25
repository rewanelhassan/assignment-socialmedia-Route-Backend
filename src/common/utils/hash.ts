import bcrypt from "bcrypt"

export const hash = async ({plainText , salt =10}
    :{
        plainText:string ,
        salt?:number
    }
)=>{
    return await bcrypt.hash(plainText,salt)
}
export const compare = async ({plainText ,  hashedText}:
    {
        plainText:string ,
        hashedText:string

    }
)=>{
    return await bcrypt.compare(plainText,hashedText)
}