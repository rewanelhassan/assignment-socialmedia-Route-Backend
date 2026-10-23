import { GraphQLInt, GraphQLObjectType, GraphQLString } from "graphql";

export const userGQLResponse= new GraphQLObjectType({
    name:"userResponse",
    fields:{
        name:{type:GraphQLString},
        age:{type:GraphQLInt},
    }

})