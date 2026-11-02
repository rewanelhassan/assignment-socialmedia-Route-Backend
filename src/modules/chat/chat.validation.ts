import z from "zod";

export const sayHiSchema = z.strictObject({
    message:z.string()
})
export const sendMessageSchema = z.strictObject({
    content:z.string(),
    sendTo:z.string,
})
export const sendGroupMessageSchema = z.strictObject({
    content:z.string(),
    groupId:z.string,
})