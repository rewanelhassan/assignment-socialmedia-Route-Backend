import mongoose from "mongoose"
 

export async function DBconnection() {
    const url = process.env.MONGO_URL !;
    try{
        await mongoose.connect(url ,{
            serverSelectionTimeoutMS:5000 ,
        });
        console.log("DB connected successfully....")

    }catch(error){
        console.log({error})
    }
    
}
