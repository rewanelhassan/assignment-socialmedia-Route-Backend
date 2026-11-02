import { BaseRepository } from "./base.repository";
import { IChat } from "../../common/interfaces/chat.interface";
import Chat from "../models/chat.model";
import {
  HydratedDocument,
  QueryFilter,
  ProjectionType,
  QueryOptions,
} from "mongoose";

export class ChatRepository extends BaseRepository<IChat> {
  constructor() {
    super(Chat);
  }

  async findOneChat({
    filter,
    projection,
    options,
    page,
    limit,
  }: {
    filter?: QueryFilter<IChat>;
    projection?: ProjectionType<IChat>;
    options?: QueryOptions<IChat>;
    page?: number;
    limit?: number;
  }) {
    const  currentpage = page ?? 5
    const  size = limit ?? 5
    const chat = await Chat.findOne(
      filter,
      {
        message: {
          $slice: [-(currentpage*size), size],
        },
      },
      options,
    );
    return chat;
  }
}
