import { GraphQLInt, GraphQLString } from "graphql"

export const getPostArgs={
    limit:{type:GraphQLInt},
    page:{type:GraphQLInt},
    search:{type:GraphQLString},
}