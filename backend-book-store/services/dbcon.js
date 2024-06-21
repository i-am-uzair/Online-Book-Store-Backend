import mongoose from "mongoose";

const dbcon = async()=>{
    await mongoose.connect('mongodb://localhost:27017/BookStore')
    console.log("mongodb connected...")
} 

export default dbcon;