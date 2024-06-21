import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
    UserId:{type:String ,required:true},
    Products:[
        {
            _id:{type:String},
            BookName:{type:String},
            Author:{type:String},
            Bookcategory:{type:String},
            ISBN:{type:String},
            PDF:{type:String},
            Price:{type:String},
            url:{type:String},

        }
    ],
    subtotal:{type:Number,required:true},
    payment_status:{type:String,default:"pending"},

})

export const order = mongoose.models.Order || mongoose.model("Order",OrderSchema);