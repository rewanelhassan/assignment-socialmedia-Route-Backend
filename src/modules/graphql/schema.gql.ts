import {
  graphql,
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
} from "graphql";
import { userSchema } from "../user/gql/user.schema";
import { postSchema } from "../post/gql/post.schema";

const query= new GraphQLObjectType({
      name: "RootQueryType",
      fields: {
        ...userSchema.registerQuery(),
        ...postSchema.registerQuery(),
        
      },
    })
const mutation= new GraphQLObjectType({
      name: "RootMutationType",
      fields: {
        ...userSchema.registerMutition(),
        ...postSchema.registerMutition(),
        
      },
    })
export const schema = new GraphQLSchema({
    query,
    mutation
    
  });
