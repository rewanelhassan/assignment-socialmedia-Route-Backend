import { Gender, Role, System } from "../../common/enums"
import {  HydratedDocument, model , Schema } from "mongoose"
import { IUser } from "../../common/interfaces/user.interface"
import { hash } from  "../../common/utils/hash"
import { encrypt } from "../../common/utils/encrypt"



const userSchema = new Schema<IUser>({
    fName:{
        type:String,
        trim:true,
        // required:true,
        minLength:3,
        maxLength:20
    },
    lName:{
        type:String,
        trim:true,
        // required:true,
        minLength:3,
        maxLength:20
    },
    password:{
        type:String,
        trim:true,
        required:true,
        minLength:3,
        maxLength:100
    },
     email:{
        type:String,
        unique:true,
        required:true,
        trim:true,
        minLength:3,
        maxLength:30
    },
    confirmedEmail:{
        type:Boolean,
        default:false
    },
    age:{
        type:Number,
        min:18,
        max:60
    },
    gender:{
        type:String,
        enum:Object.values(Gender),
        default:Gender.MAL
    },
    role:{
        type:String,
        enum:Object.values(Role),
        default:Role.USER

    },
    address:{
        city:{type:String},
        country:{type:String}
    },
    provider:{
        type:String,
        enum:Object.values(System),
        default:System.SYSTEM
    },
    coverImages:{
        type:String
    },
    isActive:{
        type:Boolean,
        default:false
    },
    phone:{
        type:String
    },
    changeConditional:Date ,
    oldPasswords:{
        type:[String]
    }

},{
    timestamps:true,
    toJSON:{virtuals:true , getters:true},
    toObject:{virtuals:true , getters:true},
    collection:"users",
    optimisticConcurrency:true,
    strict:true,
    strictQuery:true,

})

userSchema
 .virtual("fullname")
 .get( function(){
    return this.fName + " " + this.lName
 })
 .set( function (val){
    this.fName = val.split(" ")[0] || "",
    this.lName = val.split(" ")[1] || ""
 })

userSchema.pre("save",async function (){
    if(this.isModified("password")){
        this.password = await hash({plainText:this.password})
    }
    
     if (this.phone && this.isModified("phone")) {
          this.phone = encrypt(this.phone)
    }
} )

userSchema.pre("insertMany", async function (docs:any){
    for(let index of docs){
        index.password= await hash({plainText:index.password})
    }
})
// userSchema.pre( "findOne", async function (docs:any){
//     this.select("-password")
// })

 const User = model<IUser>("User",userSchema)
 export type UserHydrated = HydratedDocument<IUser> 
 export default User ;