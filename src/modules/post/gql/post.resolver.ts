import { HydratedDocument } from "mongoose";
import { UserHydrated } from "../../../DB/models/user.model";
import { PostRepository } from "../../../DB/repo/post.repository";
import { postService } from "../post.service";
import { IUser } from "../../../common/interfaces/user.interface";
import { GQLValidation } from "../../../middlewars/validation.middleware";
import { paginationSchema, reactOnPost, reactOnPostSchema } from "./post.args";

class PostResolver {
  //   private postService;
  //   private postRepo;
  constructor() {
    // this.postService = PostService;
    // this.postRepo = new PostRepository();
  }
  async getPosts(
    parent: any,
    args: { limit: number; page: number; search: string },
    context: { user: HydratedDocument<IUser>; decoded: HydratedDocument<IUser> },
  ) {
    await GQLValidation(paginationSchema,args)
    const posts = await postService.find(
      {
        limit: 10,
        page: 1,
      },
      context.user,
    );
    return posts;
  }

    async reactOnPost(
    parent: any,
    args:reactOnPost,
    context:{ user: HydratedDocument<IUser>},
  ) {
    await GQLValidation(reactOnPostSchema,args)

    const post = await postService.reactPost(args.postId , context.user)
    return post;
  }
}

export const postResolver = new PostResolver();
