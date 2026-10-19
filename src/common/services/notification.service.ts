import { initializeApp, cert, App,getApps } from "firebase-admin";
import { resolve } from "node:path";
import { readFileSync } from "node:fs";
import { getMessaging } from "firebase-admin/messaging";

export class NotificationService {
  private client: App;
  constructor() {
    const path = resolve(
        __dirname,
        "../config/social-media-14dee-firebase-adminsdk-fbsvc-9edfbf1b06.json",
      )
      console.log(path)

      const serviceAccount = JSON.parse(readFileSync(path,"utf-8"))


    this.client = initializeApp({
      credential: cert(serviceAccount),
    });
  }

 async sendNotification({
    token,
    title,
    data,
  }: {
    token: string;
    title: string;
    data: string;
  }) {
    await getMessaging(this.client).send({
        token ,
        notification:{
            title ,
            body:data,
        }
    })
  }
}

const notificationService = new  NotificationService
export default notificationService ;
 