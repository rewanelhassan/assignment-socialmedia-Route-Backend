import { GraphQLID, GraphQLInt, GraphQLString,GraphQLNonNull } from "graphql"
import z from "zod"

export const getPostArgs={
    limit:{type:GraphQLInt},
    page:{type:GraphQLInt},
    search:{type:GraphQLString},
}

export const paginationSchema = z.strictObject({
    limit:z.coerce.number().optional().default(10),
    page:z.coerce.number().optional().default(1) ,
    search:z.coerce.string().optional() ,
})

export const reactOnPostArgs={
    postId:{type:new GraphQLNonNull(GraphQLID)},
}
export const reactOnPostSchema = z.strictObject({
    postId:z.coerce.string() 
})

export type reactOnPost = z.infer<typeof reactOnPostSchema>;