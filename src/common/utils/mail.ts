import nodemailer from "nodemailer" ;
import {resolve} from  "path"

export const sendEmail = async ({
    to = "",
    cc = "",
    bcc = "",
    subject ,
    html ,
    text ="hello world from rewan" ,
    attachments = []
}:{
    to:string,
    subject:string,
    html:string,
    cc?:string,
    bcc?:string,
    text?:string,
    attachments?:string[],
})=>{
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user:  "rewanelhassan4@gmail.com",
            pass:  "hjkr hjkl jklk jkkk",

        }
  
})
 
try{
    const info = await transporter.sendMail({
        from:"rewanelhassan4@gmail.com",
        to,
        cc,
        bcc,
        subject,
        html,


    })
}catch(err){
    console.error("error while send mail ", err)
}

}