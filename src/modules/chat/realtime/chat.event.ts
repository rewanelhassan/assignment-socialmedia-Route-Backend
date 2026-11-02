import { IAuthSocket } from "../../../common/interfaces/request.interface";
import redisService from "../../../common/services/redis.service";
import { UserHydrated } from "../../../DB/models/user.model";
import { SocketValidation } from "../../../middlewars/validation.middleware";
import { chatService } from "../chat.service";
import {
  sayHiSchema,
  sendGroupMessageSchema,
  sendMessageSchema,
} from "../chat.validation";
import { Server } from "socket.io";
class ChatEvents {
  private chatService;
  constructor() {
    this.chatService = chatService;
  }

  sayHi = (socket: IAuthSocket) => {
    return socket.on("sayHi", async (data) => {
      try {
        await SocketValidation(sayHiSchema, data);
        socket.on("sayHi", async (data) => {
          socket.emit("response", `hello ${socket.user?.email}`);
        });
      } catch (err: any) {
        console.log({ err });
        socket.emit("cuntom-error", err.message);
      }
    });
  };

  sendMessage = (socket: IAuthSocket, io: Server) => {
    return socket.on("sendMessage", async (data) => {
      try {
        await SocketValidation(sendMessageSchema, data);
        const chat = await this.chatService.sendMessage(data, socket.user!);
        const userSockets = await redisService.getSockets(
          (socket.user as UserHydrated).id,
        );
        if (userSockets.length > 0)
          io.to(userSockets).emit("successMessage", data);

        const recieverSockets = await redisService.getSockets(data.sendTo);
        if (recieverSockets.length > 0)
          socket.to(recieverSockets).emit("newMessage", {
            content: data.content,
            from: socket.user as UserHydrated,
          });
      } catch (err: any) {
        console.log({ err });
        socket.emit("cuntom-error", err.message);
      }
    });
  };

  joinGroupRoom =(socket: IAuthSocket, io: Server) => {
    return socket.on("join_room", async (data) => {
      try {
 
        const chat = await this.chatService.getGroupChatById(data.roomId);
        socket.join(data.roomId)
      } catch (err: any) {
        console.log({ err });
        socket.emit("cuntom-error", err.message);
      }
    });
  };

  sendGroupMessage = (socket: IAuthSocket, io: Server) => {
    return socket.on("sendGroupMessage", async (data) => {
      try {
        await SocketValidation(sendGroupMessageSchema, data);
        const chat = await this.chatService.sendGroupMessage(
          data,
          socket.user!,
        );
        const userSockets = await redisService.getSockets(
          (socket.user as UserHydrated).id,
        );
        if (userSockets.length > 0)
          io.to(userSockets).emit("successMessage", {
            content: data.content,
            sendTo: data.groupId,
          });

 
          socket
            .to(chat.room_id as string)
            .emit("newMessage", {
              content: data.content,
              from: socket.user as UserHydrated,
              groupId:chat.room_id,
            });
      } catch (err: any) {
        console.log({ err });
        socket.emit("cuntom-error", err.message);
      }
    });
  };
}

export const chatEvent = new ChatEvents();
