import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({

    Name:{type:String,required:true},
    Email:{type:String,required:true,unique:true},
    Password:{type:String,required:true},
    ConfirmPassword:{type:String,required:true},
    Address:{type:String},
    PhoneNumber:{type:String},
    verified:{type:Boolean,default:false},
    Carts:[{type:mongoose.Schema.Types.ObjectId,ref:'books'}],
    purchased_book:[{type:mongoose.Schema.Types.ObjectId,ref:'orders'}],
})

export const User = mongoose.models.Users || mongoose.model("Users",UserSchema);