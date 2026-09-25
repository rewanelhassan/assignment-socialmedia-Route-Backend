import { EventEmitter } from "node:stream";

const emailEmitter = new EventEmitter();

emailEmitter.on("sendEmail",(fn)=>{
    try{
        fn()
    }catch(error){
        console.log({error})
    }
})

export default emailEmitter ;