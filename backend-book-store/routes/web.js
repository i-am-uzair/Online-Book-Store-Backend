import { User } from "../models/user.js";
import { order } from "../models/order.js";
import express from "express";
import userController from "../controller/userController.js";
import booksController from "../controller/booksController.js";
import AdminController from "../controller/AdminController.js";

import jwt from "jsonwebtoken"
const router = express.Router();

router.use(express.json());


// for pdf purpose
import multer from "multer";
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './files')
    },
    filename: async function (req, file, cb) {
        cb(null, file.originalname)
    }
  })
  
  const upload = multer({
    storage: storage
  })


  import path from "path";
  import { books } from "../models/books.js";
  import bcrypt from "bcrypt"
  import nodemailer from "nodemailer"

  // admin related routes
  router.post('/adminRegistration',AdminController.AdminRegistration)
  router.get('/AdminVerify/:token',AdminController.AdminVerification)
  router.post('/AdminLogin',AdminController.Adminlogin)
  router.get('/AdminAuth',AdminController.AdminAuth)
  router.get('/dashboardDetails',AdminController.DashboardDetails)
  router.get('/UserQueryMessage',AdminController.UserQueryMessage)
  router.post('/AdminForgetPassword',AdminController.AdminForgetPassword)
  router.post('/AdminResetPassword',AdminController.AdminResetPassword)
  

  // user related routes
  router.post('/Registration',userController.userRegistration)
  router.get('/verify/:token',userController.userVerification)
  router.post('/login',userController.loginUser)
  router.post('/addToCart',userController.UserAddToCart)
  router.patch('/removeToCart',userController.UserRemoveToCart)
  router.get('/getUserCart',userController.userCartDetails)
  router.get('/AuthUser',userController.AuthUser)
  router.get('/userOrder',userController.userOrder)
  router.post('/customerQuery',userController.customerQuery)
  router.post('/ChangePassword',userController.ChangePassword)
  router.post('/ForgetPassword',userController.ForgetPassword)
  router.post('/ResetPassword',userController.ResetPassword)
  router.get('/Search/:text',async(req,res)=>{
    // console.log(req.params.text)
    const results = await books.find({ $text: { $search:req.params.text} });
    
    res.json({message:"items fetched",status:true,results})
  })
 

  

  // books related routes
  router.post('/upload-files',upload.single('file'),booksController.uploadBook)
  router.post('/updateBook',upload.single('file'),booksController.updateBook)
  router.delete('/deleteBook',booksController.removeBook)
  router.get('/books',booksController.getAllBooks)
  router.get('/books/:id',booksController.getSingleBook)
  // router.get('/books/:id',booksController.getSingleBook)

  // testing only 
  import stripe from 'stripe'
  
  router.post('/create-checkout-session', async (req, res) => {
    
    // store the cart data in the data variable
    const data = req.body
    // console.log("bhai data chlra h ",data)
    // make an object of an Stripe class
    const Stripe = new stripe(process.env.SECRET_STRIPE_KEY)
    // get the Authentication token from cookie 
    const {AuthToken} = req.cookies
    // verify the token 
    const token = jwt.verify(AuthToken,process.env.JWT_KEY)
    // get the user details into the database 
    const UserDetails = await User.findOne({_id:token._id}).select('-Desc')
  // store the id of the customer and cart items in the stripe 
    const customer = await Stripe.customers.create({
      metadata:{
        userId:JSON.stringify(UserDetails._id),
        cart:JSON.stringify(data)
      }
    })
  //  const totalAmmount = data.map((item)=>{
  //   return item.Price
  //  })
  //  const charge = await stripe.charges.create({
  //   amount: parseInt(totalAmmount),
  //   currency: 'inr',
  //   source: 'tok_visa',
  // });
    // store the total books in items array
    const items = 
      data.map((item)=>{
       return{
        price_data: {
          currency: 'inr', // Change currency if needed
          product_data: {
            name: item.BookName,
            metadata:{
              id:item._id
            }
          },
          unit_amount: parseInt((item.Price)*100), // in INR  
        },
        quantity: 1,
       } 
      })

    try {

      // create the checkout session of stripe
      const session = await Stripe.checkout.sessions.create({
        payment_method_types:['card'],
         mode: 'payment',
         customer:customer.id,
         line_items: items,
         success_url: `${'http://localhost:3000/Success'}`,
         cancel_url: `${'http://localhost:3000/Cancel'}`,
       });

    //    console.log("session chlra  h jab create hoga", session.line_items)
       res.json({url:session.url});
    } catch (error) {
     res.json({message:error.message}) 
    }
    
  });

  // indian transection id for payment 
  // 4000003560000008

  // for testing purpose routes

  
const queryGemini = require('./gemini'); // Assuming gemini.js is in the same directory

(async () => {
  const prompt = 'Write a poem about nature.';
  const response = await queryGemini(prompt);

  if (response) {
    console.log(response);
  } else {
    console.error('Failed to get response from Gemini AI.');
  }
})();


export default router;
