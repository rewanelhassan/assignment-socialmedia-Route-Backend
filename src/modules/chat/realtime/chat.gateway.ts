import { IAuthSocket } from "../../../common/interfaces/request.interface";
import {Server}from "socket.io"
class ChatGateway {
    private chatEvent :any ;
    constructor (){
        this.chatEvent = this.chatEvent ;
    }

    registerEvents(socket:IAuthSocket , io:Server){
        this.chatEvent.sayHi(socket)
        this.chatEvent.sendMessage(socket)
        this.chatEvent.sendGroupMessage(socket)


    }
}

export const chatGateway = new ChatGateway()