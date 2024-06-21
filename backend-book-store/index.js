import  Express, { Router, json, urlencoded } from "express";
import router  from "./routes/web.js";
import dbcon from "./services/dbcon.js";
import dotenv from "dotenv"
import cors from "cors"
import cookieParser from "cookie-parser";


// config the dot env 
dotenv.config()

import stripe from 'stripe'
import { order } from "./models/order.js";
import { User } from "./models/user.js";
const Stripe = new stripe('sk_test_51P5VFfSJvl1J8BFgbx1pY2pxf6c5IckDz6A545WMtjO7OjKoUfc9ku27PjqDsZuCGGFkPRVWHxKi01HrxjizDXnO00At4w7Fy8')




// initilize the app
const app = Express();
app.use('/files',Express.static("files"))
app.use(Express.static(process.cwd + 'files')); //Serves resources from public folder

// enabiling the cors
app.use(cors({
    origin:'http://localhost:3000',
    credentials:true
}))


app.use(cookieParser())

// database connection
dbcon();

app.use(urlencoded({extended:true}))

app.use('/webhook', Express.raw({ type: 'application/json' }));

// create the order of the customers and remove the user cart of that items

const createOrder = async(data,customer)=>{
  const Items =  JSON.parse(customer.metadata.cart)
  const userId  = JSON.parse(customer.metadata.userId) 

  // console.log("item ",Items)
  var subtotal = null;
  Items.map(item=>{
    subtotal += parseInt(item.Price) 
  })

  const neworder = new order({
    UserId:userId,
    Products:Items,
    subtotal:subtotal,
    payment_status:data.payment_status,
  })
  try {
    const doc = await neworder.save()
    const updateUser = await User.findByIdAndUpdate({_id:userId},{$push:{purchased_book:doc._id}})
    Items.map(async(item)=>{
      const removecartitem = await User.findByIdAndUpdate({_id:userId},{$pull:{Carts:item._id}})  
    })
    // console.log("remove cart item chlra h ",removecartitem)
  } catch (error) {
    console.log(error)
  }
}
router.post("/webhook",async(req, res) => {
    const payload = req.body;
    // console.log("upper wala chlra h bhai sahab",payload)
    const signature = req.headers['stripe-signature'];
  
    try {
      const event = Stripe.webhooks.constructEvent(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
  
      if (event.type === 'checkout.session.completed') {
        const data = event.data.object;

        Stripe.customers.retrieve(data.customer).then((customer)=>{
          createOrder(data,customer)
          }).catch(err=>{
            console.log(err.message)
          })
      
        console.log('Payment successful and product stored in MongoDB');
      }
  
      res.status(200).end();
    } catch (err) {
      console.error("error aa gya bsdke ",err);
      res.status(500).end();
    }
    }
  );

//   async function handleCheckoutSession(session) {  
// //    console.log(session.id)
//     // You need to have stripe imported and initialized with your API key  
//     const checkoutSession = await Stripe.checkout.sessions.retrieve(session.id, {  
//       expand: ['line_items'],  
//     });  
    
//     const lineItems = checkoutSession.line_items.data;  
//     console.log(lineItems)
//     // Save the lineItems to your database  
//     // Your logic for saving the items to the database goes here  
//   }  

app.use(json());

// define the routes
app.use('/',router)


app.listen(3001,()=>{
    console.log("server is runing at port 3001")
})
