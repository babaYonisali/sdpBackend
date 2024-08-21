const mongoose=require('mongoose')
const connectDB= async()=>{
    try{
        mongoose.set('strictQuery',false);
        const conn= await mongoose.connect("mongodb+srv://2460755:qg2XJWBsvqW5yfJt@sdpcluster.vux5q.mongodb.net/");
        console.log(`Database connected: ${conn.connection.host}`)
    }catch(error){
        console.log(error)
    }
}
module.exports=connectDB;