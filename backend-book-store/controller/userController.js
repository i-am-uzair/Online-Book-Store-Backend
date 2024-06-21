import { User } from "../models/user.js";
import bcrypt from "bcrypt"
import  jwt  from "jsonwebtoken";
import nodemailer from "nodemailer"
import { books } from "../models/books.js"
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
               http://localhost:3001/verify/${token}  
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

class userController{

    // registration user logic
    static async userRegistration(req,res){
        
    const {name,email,password,confirmPassword} = req.body;
    // console.log(name,email,password,confirmPassword)
    if(name && email && password && confirmPassword){
        const userEmail = await User.findOne({Email:email})
        if(userEmail){
           
            if(userEmail.verified === false){         

                //  create the token for authentication
                const token = jwt.sign({
                _id:userEmail._id
                },process.env.JWT_KEY,{expiresIn:'10m'})
                sendEmailFunction(userEmail.Email,token)
                res.status(200).json({message:"Email verification send to your email"})
            }else{
                res.status(200).json({message:"Already register"})
            }
        }else{
            if(password == confirmPassword){

                const newPassword = await bcrypt.hash(password,Number(process.env.GENSALT))
                const doc = new User({
                    Name:name,
                    Email:email,
                    Password:newPassword,
                    ConfirmPassword:newPassword,
                })
               const result = await doc.save()
              
            //    create the token for authentication
              const token = jwt.sign({
                _id:result._id
              },process.env.JWT_KEY,{expiresIn:'10m'})

                sendEmailFunction(email,token)
                res.status(201).json({message:"user register success"})
            }else{
                res.status(200).json({message:"password does not match"})
            }
        }
    }else{
        res.status(200).json({message:"all fileds are required"})
    }

    }



    // this code is for verification that a new user will have to verify
    static async userVerification(req,res){
        const {token} = req.params

        // Verifying the JWT token
        const data = jwt.verify(token,process.env.JWT_KEY)
        
        const updateUser = await User.findByIdAndUpdate(data._id,{$set:{verified:true}})
        if(updateUser){
            res.send("Email verifified successfully"); 
        }else{
            res.send("Email verification failed, possibly the link is invalid or expired");    
        }
       
    }


    // this code is for login the user

    static async loginUser(req,res){
        const {email,password} = req.body
        const {AuthToken} = req.cookies
        // console.log(req.cookies)
        // if(AuthToken){
        //     res.json({message:"user already logged in",status:true})
        // }
        // else{
        if(email && password){
            const userEmail = await User.findOne({Email:email})
            if(userEmail){
                if(userEmail.verified === true){
                    const result = await bcrypt.compare(password,userEmail.Password)
                    if(result){
                    
                    // creating the token for authentication
                    const token = jwt.sign({
                            _id:userEmail._id
                        },process.env.JWT_KEY)
        
                        res.cookie("AuthToken",token).status(200).json({message:"user logged In success",Status:true})
                    }else{
                        res.status(200).json({message:"userName or password does not match",Status:false})
                    }
                }else{
                    res.status(200).json({message:"No user found",Status:false})
                }
        }else{
            res.status(200).json({message:"No user found",Status:false})
        }
        }else{
            res.status(200).json({message:"all fileds are required",Status:false})
        }    
    // }

    }

    // user authenticated code
  static async AuthUser(req,res,next){
          const {AuthToken} = req.cookies
          // console.log(AuthToken)
          if(AuthToken){
            const token =  jwt.verify(AuthToken,process.env.JWT_KEY)
              const doc = await User.findOne({_id:token._id})
              if(doc){
                res.status(200).json({message:"user is already logged in",Status:true,doc})
              }else{
                res.json({message:"Unauthorized user",Status:false})
              }    
          }else{
            res.json({message:"Unauthorized user",Status:false})
            } 
          }

  
    static async UserAddToCart(req,res){
        const {AuthToken} = req.cookies
        const {id} = req.body
        if(AuthToken && id){
            const token =  jwt.verify(AuthToken,process.env.JWT_KEY)
            const doc = await User.findOne({_id:token._id})
            if(doc){
                const result = await User.findOneAndUpdate({_id:token._id},{$push:{Carts:id}})
                // console.log(result)
                res.status(200).json({message:"item added successfully",Status:true})
            }else{
              res.json({message:"Unauthorized user",Status:false})
            }    
        }else{
            res.json({message:"you need to login",Status:false})
        } 
    }
    
    static async UserRemoveToCart(req,res,next){
        const {AuthToken} = req.cookies
        const {id} = req.body
        if(AuthToken && id){
            const token =  jwt.verify(AuthToken,process.env.JWT_KEY)
            const doc = await User.findOne({_id:token._id})
            if(doc){
                const result = await User.findOneAndUpdate({_id:token._id},{$pull:{Carts:id}})
                // console.log(result)
                res.status(200).json({message:"item removed successfully",Status:true})
            }else{
              res.json({message:"Unauthorized user",Status:false})
            }    
        }else{
            res.json({message:" data is missing",Status:false})
        } 
    }

    static async userCartDetails(req,res,next){
        const {AuthToken} = req.cookies
        if(AuthToken){
            const token =  jwt.verify(AuthToken,process.env.JWT_KEY)
            const doc = await User.findOne({_id:token._id})
            // console.log(doc)
            if(doc){
                var booksId = []
                var userBooks = []
                 User.findOne({_id:token._id}).then(data=>{
                    // console.log(data)
                    data.Carts.map(item=>{
                        booksId.push(item._id)
                    })

                    books.find({_id:booksId}).select('-Desc').then(book=>{
                        res.status(200).json({message:"item fetched successfully",Status:true,books:book})
                    }).catch(error=>{
                        console.log(error)
                    })
                    
                 }).catch(err=>{
                    console.log(err)
                 })
            }else{
              res.json({message:"Unauthorized user",Status:false})
            }    
        }else{
            res.json({message:" data is missing",Status:false})
        } 
    }

    static async userOrder(req,res,next){
        const {AuthToken} = req.cookies
        if(AuthToken){
            const token =  jwt.verify(AuthToken,process.env.JWT_KEY)
            const doc = await User.findOne({_id:token._id})
            // console.log(doc)
            if(doc){

                const result = await User.aggregate([{
                    $lookup:{
                        from:'orders',
                        localField:'purchased_book',
                        foreignField:'_id',
                        as:'cust_book'
                    }
                }])
                var books
                result.map((item)=>{
                        books = item.cust_book
                })

            var products
            books.map(function(item){
                  
                    products = item.Products
                })
                
                // console.log(books)
                res.status(200).json({message:"item fetched successfully",Status:true,products})
            }else{
              res.json({message:"Unauthorized user",Status:false})
            }    
        }else{
            res.json({message:" data is missing",Status:false})
        } 
    }

    static async customerQuery(req,res) {
        const {AuthToken} = req.cookies
        const {Email,Message,Name} = req.body
        if(Email && Message && Name){
        if(AuthToken){
            const token =  jwt.verify(AuthToken,process.env.JWT_KEY)
            if(token){
            const doc = await contact({
                Name:Name,
                Email:Email,
                Message:Message
            })

            await doc.save()
            res.json({message:"your query has been sent",status:true})
            }else{
            res.json({message:"you you need to login first",status:false})  
            }
        }else{
            res.json({message:"you you need to login first",status:false})
        }
        }else{
        res.json({message:"all feilds are required",status:false})
        }
    }
    
    static async ChangePassword(req,res){
        const {AuthToken} = req.cookies
        const {OldPassowrd,NewPassword} = req.body
        if(OldPassowrd && NewPassword){
            if(AuthToken){
            const token =  jwt.verify(AuthToken,process.env.JWT_KEY)
                if(token){
                    const result = await User.findOne({_id:token._id})
                   
                    const passowrd = await bcrypt.compare(OldPassowrd,result.Password)
                    if(passowrd){
                        const newPassword = await bcrypt.hash(NewPassword,Number(process.env.GENSALT))
                        const update = {Password:newPassword,ConfirmPassword:newPassword}
                        const doc = await User.updateOne({_id:token._id},update,{new:true})
                        res.json({message:"Password has been Reset",status:true})
                    }else{
                        res.json({message:"Old password is incorrect",status:false})
                    }
                }else{
                res.json({message:"you you need to login first",status:false})  
                }
            }else{
                res.json({message:"you you need to login first",status:false})
            }
        }else{
            res.json({message:"all feilds are required",status:false})
        }
    }

    
    static async ForgetPassword(req,res){
        const {email} = req.body
        // console.log(email)
        if(email){
          const checkUserExist = await User.findOne({Email:email})
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

    static async ResetPassword(req,res){
        const {Password,ConfirmPassword,token} = req.body
        console.log(Password)
        if(Password && ConfirmPassword && token){
        if(Password==ConfirmPassword){

        try {
            const data = jwt.verify(token,process.env.JWT_KEY)
            console.log("113",data)
            const newPassword = await bcrypt.hash(Password,Number(process.env.GENSALT))
            const update = {Password:newPassword,ConfirmPassword:newPassword}
            const doc = await User.updateOne({_id:data._id},update,{new:true})
            res.json({message:"password has been changed",status:true})
        } catch (error) {
            res.json({message:"invalid token",status:false})           
        }
        }else{
        res.json({message:"Password does not match",status:false})
        }
        }else{
        res.json({message:"All fields are required",status:false})
        }
    }
}


export default userController;