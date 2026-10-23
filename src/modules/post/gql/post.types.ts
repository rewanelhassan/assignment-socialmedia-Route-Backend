import { GraphQLID, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString } from "graphql";

export const postGQLResponse = new GraphQLObjectType({
    name:"postGQLResponse",
    fields:{
        _id:{type:new GraphQLNonNull(GraphQLID) },
        content:{type:GraphQLString},
        attachment:{type:new GraphQLList(GraphQLString) },
        available:{type: GraphQLString },
    }

})

export const PostsGQLResponse = new GraphQLList(postGQLResponse)