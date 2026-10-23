class UserResolver {
  constructor() {}
  sayHi(parent: any, args: { name: string; age: number }, context: any) {
    return { name: args.name, age: args.age };
  }
  hello(){
    return "hello"
  }
}

export const userResolver = new UserResolver();