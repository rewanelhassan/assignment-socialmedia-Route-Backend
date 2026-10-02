import { Gender, Role, System } from "../../common/enums"
export type IUser ={
    fName:string ,
    lName:string ,
    email:string ,
    confirmedEmail:boolean,
    password:string ,
    phone?:string ,

    profileImage?:string ,
    coverImages?:string[] ,
    age?:number ,
     address:{
        city:string ,
        country:string,
    },
    isActive:boolean,
    changeConditional:Date ,
    oldPasswords:string[],

    role:Role,
    gender:Gender,
    provider:System,

    createdAt?: Date ,
    updatedAt?: Date 

}