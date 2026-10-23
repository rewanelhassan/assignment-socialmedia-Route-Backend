import { GraphQLInt, GraphQLNonNull, GraphQLString } from "graphql";

export const userArgs = {
  name: { type: new GraphQLNonNull(GraphQLString) },
  age: { type: new GraphQLNonNull(GraphQLInt) },
};
