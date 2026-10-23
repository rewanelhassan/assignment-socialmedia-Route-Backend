import { GraphQLString } from "graphql";
import { postResolver } from "./post.resolver";
import { resolve } from "node:dns";
import { getPostArgs } from "./post.args";
import { PostsGQLResponse } from "./post.types";

class PostSchema {
    private postResolver ;
  constructor() {
    this.postResolver=postResolver;
  }
  registerQuery() {
    return {
        getPosts:{
            type:PostsGQLResponse,
            args:getPostArgs,
            resolve:this.postResolver.getPosts,
        }
    };
  }

  registerMutition() {
    return {};
  }
}

export const postSchema = new PostSchema();
