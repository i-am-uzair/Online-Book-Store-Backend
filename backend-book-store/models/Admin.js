import mongoose from "mongoose";

const AdminSchema = new mongoose.Schema({

    Name:{type:String,required:true},
    Email:{type:String,required:true,unique:true},
    Password:{type:String,required:true},
    ConfirmPassword:{type:String,required:true},
    verified:{type:Boolean,default:false},
})

export const Admin = mongoose.models.Admins || mongoose.model("Admins",AdminSchema);