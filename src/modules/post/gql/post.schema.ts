import { GraphQLString } from "graphql";
import { postResolver } from "./post.resolver";
import { resolve } from "node:dns";
import { getPostArgs, reactOnPostArgs } from "./post.args";
import { postGQLResponse, PostsGQLResponse } from "./post.types";

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
    return {
        reactOnPost:{
            type:postGQLResponse,
            args:reactOnPostArgs,
            resolve:this.postResolver.reactOnPost,
        }
    };
  }
}

export const postSchema = new PostSchema();
