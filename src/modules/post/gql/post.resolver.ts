import { PostRepository } from "../../../DB/repo/post.repository";
import { PostService } from "../post.service";

class PostResolver {
//   private postService;
//   private postRepo;
  constructor() {
    // this.postService = PostService;
    // this.postRepo = new PostRepository();
  }
  async getPosts(
    parent: any,
    args: { limit: number; page: number , search:string},
    context: any,
  ) {
    // const posts = await PostService.findAll({
    //   limit: 10,
    //   page: 1,
    // });
    // return posts;
  }
}

export const postResolver = new PostResolver();
