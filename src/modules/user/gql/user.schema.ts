import { GraphQLInt, GraphQLNonNull, GraphQLString } from "graphql";
import { userGQLResponse } from "./user.types";
import { userResolver } from "./user.resolver";
import { userArgs } from "./user.args";



class UserSchema{
    private userResolver;

    constructor(){
        this.userResolver=userResolver;
    }

    registerQuery(){
        return {
            sayHi:{
                type:userGQLResponse,
                args: userArgs,
                resolve : this.userResolver.sayHi,
            }
        }

    }

    registerMutition(){
        return {
            hello: {
        type: GraphQLString,
        resolve:this.userResolver.hello

        }
    }
}
}

export const userSchema = new UserSchema;
