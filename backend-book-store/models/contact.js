import mongoose from "mongoose";

const contactSchema = new mongoose.Schema({

    Name:{type:String,required:true},
    Email:{type:String,required:true},
    Message:{type:String}
})

export const contact = mongoose.models.contacts || mongoose.model("contacts",contactSchema);