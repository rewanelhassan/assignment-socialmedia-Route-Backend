import { Server } from "socket.io";
import { IAuthSocket } from "../../common/interfaces/request.interface";
import { BadRequestException, NotFoundException } from "../../common/response";
import { TokenType } from "../../common/enums/token";
import tokenService from "../../common/services/token.service";
import { UserRepository } from "../../DB/repo/user.repository";
import redisService from "../../common/services/redis.service";
import { NextFunction } from "express";
import { chatGateway } from "../chat/realtime/chat.gateway";

class RealTimeGateWay {
  private io!: Server;
  private chatGateway ;
  constructor() {
    this.chatGateway= chatGateway ;
  }

  private authorization = async (socket: IAuthSocket, next: any) => {
    try {
      const token =
        socket.handshake.auth.authorization ||
        socket.handshake.headers.authorization;
      if (!token) {
        throw new BadRequestException("token required");
      }
      const decoded = await tokenService.decodeToken(token, TokenType.ACCESS);
      if (!decoded) {
        throw new NotFoundException("user not found");
      }
      const userRepo = new UserRepository();
      const user = await userRepo.findOne({ filter: { _id: decoded.sub } });
      if (!user) {
        throw new NotFoundException("user not found");
      }

      await redisService.setSocket(user.id, socket.id);

      socket.user = user;
      next();
    } catch (error) {
      console.log({ error });
      next(new Error("socket error"));
    }
  };

  initialize = (httpServer: any) => {
    const io = new Server(httpServer, {
      cors: {
        origin: "*",
      },
    });

    this.io.use(this.authorization);

    this.io.on("connection", async (socket: IAuthSocket) => {

        this.chatGateway.registerEvents(socket , this.io)
    



      socket.on("disconnect", async (data) => {
        console.log("disconnect" + { data });
        await redisService.deleteSockets(socket.user?.id as string, socket.id);
      });
    });
  };
}

export const realTimeGateway = new RealTimeGateWay()
