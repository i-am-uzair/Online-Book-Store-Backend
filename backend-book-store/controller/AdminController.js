import { Admin } from "../models/Admin.js";
import bcrypt from "bcrypt"
import  jwt  from "jsonwebtoken";
import nodemailer from "nodemailer"
import { User } from "../models/user.js";
import { order } from "../models/order.js";
import { contact } from "../models/contact.js";

// this code is for email system 
const transporter = nodemailer.createTransport({
  service:"gmail",
  auth:{
      user:"tempmail.10110@gmail.com",
      pass:'xpjy rove pvnp nxko'
  }
}) 

const sendEmailFunction =async(email,token)=>{
   //   configure the email system to be send 
   const mailConfigurations = { 

      // It should be a string of sender/server email 
      from: 'tempmail.10110@gmail.com', 
    
      to: email, 
    
      // Subject of Email 
      subject: 'Email Verification', 
        
      // This woul    d be the text of email body 
      text: `Hi! There, You have recently visited  
             our website and entered your email. 
             Please follow the given link to verify your email 
             http://localhost:3001/AdminVerify/${token}  
             Thanks` 
  }; 

  
    // this will send the email
    transporter.sendMail(mailConfigurations, function(error, info){ 
      if (error) throw Error(error); 
      console.log('Email Sent Successfully'); 
      console.log(info); 
  });
}

const sendForgetEmailFunction =async(email,token)=>{
  //   configure the email system to be send 
  const mailConfigurations = { 

     // It should be a string of sender/server email 
     from: 'tempmail.10110@gmail.com', 
   
     to: email, 
   
     // Subject of Email 
     subject: 'Email Verification', 
       
     // This woul    d be the text of email body 
     text: `Hi! There, Click on this link to forget the password 
            http://localhost:3000/ForgetPassword/${token}  
            Thanks` 
 }; 

 
   // this will send the email
   transporter.sendMail(mailConfigurations, function(error, info){ 
     if (error) throw Error(error); 
     console.log('Email Sent Successfully'); 
     console.log(info); 
 });
}



class AdminController{

  static async AdminRegistration(req, res) {
    const { name, email, password, confirmPassword } = req.body
    // console.log(name,email,password,confirm_Password)
    if (name && email && password && confirmPassword) {
      const AdminEmail = await Admin.findOne({ Email: email });
          if (AdminEmail) {
            if(AdminEmail.verified === false){         

              //  create the token for authentication
              const token = jwt.sign({
              _id:AdminEmail._id
              },process.env.JWT_KEY,{expiresIn:'10m'})
              
              sendEmailFunction(AdminEmail.Email,token)
             
              res.json({message:"Email verification send to your email",Status: true})
          }else{
              res.json({message:"Already register",Status: false})
          }
      } else {
        if (password == confirmPassword) {
          const newPassword = await bcrypt.hash(
            password,
            Number(process.env.GENSALT)
          );
          const doc = new Admin({
            Name: name,
            Email: email,
            Password: newPassword,
            ConfirmPassword: newPassword,
          });
          const result = await doc.save();

          //    create the token for authentication
          const token = jwt.sign(
            {
              _id: result._id,
            },
            process.env.JWT_KEY,
            { expiresIn: "10m" }
          );
          sendEmailFunction(email,token)
          res
            .status(201)
            .json({ message: "user register success" });
        } else {
          res.status(200).json({ message: "password does not match" });
        }
      }
    } else {
      res.status(200).json({ message: "all fileds are required" });
    }
  }

  // this code is for verification that a new Admin will have to verify
  static async AdminVerification(req, res) {
    const { token } = req.params;

    // Verifying the JWT token
    const data = jwt.verify(token, process.env.JWT_KEY);

    const updateUser = await Admin.findByIdAndUpdate(data._id, {
      $set: { verified: true },
    });
    if (updateUser) {
      res.send("Email verifified successfully");
    } else {
      res.send(
        "Email verification failed, possibly the link is invalid or expired"
      );
    }
  }

  // this code is for login the Admin

  static async Adminlogin(req, res) {
    const { email, password } = req.body;
    const { AuthAdmin } = req.cookies;
      if (email && password) {
        const AdminEmail = await Admin.findOne({ Email: email });
        if(AdminEmail){
          if (AdminEmail.verified===true) {
            const result = await bcrypt.compare(password, AdminEmail.Password);
            if (result) {
              // creating the token for authentication
                const token = jwt.sign(
                {
                  _id: AdminEmail._id,
                },
                process.env.JWT_KEY
                );

            res
              .cookie("AuthAdmin", token)
              .status(200)
              .json({ message: "Admin logged In success",Status: true  });
            }else{
              res.status(200)
              .json({ message: "userName or password does not match" ,Status: false });
            }
          }else{
            res.status(200).json({ message: "No Admin found" ,Status: false });
          }
        }else{
          res.status(200).json({ message: "No Admin found" ,Status: false });
        }
      }else{
        res.status(200).json({ message: "all fileds are required" ,Status: false });
      }
  }

  

  static async AdminAuth(req, res, next) {
    const { AuthAdmin } = req.cookies;
    // console.log(AuthToken)
    if (AuthAdmin) {
      const token = jwt.verify(AuthAdmin, process.env.JWT_KEY);
      const doc = await Admin.findOne({ _id: token._id });
      if (doc) {
        res
          .status(200)
          .json({ message: "Admin is already logged in", Status: true });
      } else {
        res.json({ message: "Unauthorized Admin", Status: false });
      }
    } else {
      res.json({ message: "Unauthorized Admin", Status: false });
    }
  }


  static async DashboardDetails(req,res){
    const users = await User.find({})
    const orders = await order.find({})
    var usersCount = users.length
    var ordersCount = orders.length

    var income = 0
    orders.map(item=>{
      income += item.subtotal
    })
    
    res.json({message:"fetched the deshboard details",users:usersCount,orders:ordersCount,income:income})
  }

  static async UserQueryMessage(req,res){
    const doc = await contact.find({})
    // console.log(doc)
    res.json({message:"user Query fetched",status:true,doc})
  }

  static async AdminForgetPassword(req,res){
    const {email} = req.body
        // console.log(email)
        if(email){
          const checkUserExist = await Admin.findOne({Email:email})
        //   console.log(checkUserExist)
          if(checkUserExist){
            const token = jwt.sign({
              _id:checkUserExist._id
            },process.env.JWT_KEY,{expiresIn:'10m'})
            console.log(token)
            sendForgetEmailFunction(email,token)

          res.json({message:"Link has been sent to your email",status:true})
          
        }else{
            res.json({message:"wrong Email user not exist",status:false})
          }
        }else{
          res.json({message:"you did not provide the email",status:false})
        }
  }

  static async AdminResetPassword(req,res){
    const {Password,ConfirmPassword,token} = req.body
    // console.log(Password)
      try {
        const data = jwt.verify(token,process.env.JWT_KEY)  
        if(Password && ConfirmPassword){
          if(Password==ConfirmPassword){  
          //  console.log("113",data)
           const newPassword = await bcrypt.hash(Password,Number(process.env.GENSALT))
           const update = {Password:newPassword,ConfirmPassword:newPassword}
           const doc = await Admin.updateOne({_id:data._id},update,{new:true})
           console.log(doc)
           res.json({message:"password has been changed",status:true})
       }else{
         res.json({message:"Password does not match",status:false})
        }
       }else{
         res.json({message:"All fields are required",status:false})
       }
      } catch (error) {
        console.log(error)
        res.json({message:"invalid token",status:false})
      }
  }
} 


export default AdminController