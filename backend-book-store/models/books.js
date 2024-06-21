import mongoose from "mongoose";

const BookSchema = new mongoose.Schema({
    BookName:{type:String ,required:true},
    Author:{
        type:String ,
        required:true,
    },
    Bookcategory:{type:String},
    ISBN:{type:String},
    PDF:{type:String},
    Price:{type:String ,required:true},
    url:{type:String ,required:true},
    // Stock:{type:String ,required:true},
    Desc:{type:String},
})

BookSchema.index({ BookName: 'text', Author: 'text', Bookcategory: 'text' });

export const books = mongoose.models.Book || mongoose.model("Book",BookSchema);