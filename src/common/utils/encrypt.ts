import crypto from "crypto";
import { BadRequestException } from "../response";
const key = Buffer.from ("12345678901234567890123456789098")


export const encrypt = (text:string)=>{
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipheriv("aes-256-cbc",key , iv)
    let encrypted=cipher.update(text,"utf-8","hex")
    encrypted+=cipher.final("hex")
    return`${iv.toString("hex")}:${encrypted}`
}

export const decrypt = (text:string)=>{
    const [ivHex , encrypted ]= text.split(":")
    if(!ivHex|| ! encrypted ) throw new BadRequestException("invalid ivHex or encrypted  ")
    const iv  = Buffer.from(ivHex  as string, "hex")
    const decipher = crypto.createDecipheriv("aes-265-cbc",key , iv)
    let decrypted=decipher.update(encrypted as string , "hex" ,"utf-8")
    decrypted+=decipher.final("utf-8")
    return decrypted;
}
