import { User } from "../models/user.js"


const AuthUser = async(req,res,next)=>{
    const {AuthToken} = req.cookies
    // console.log(AuthToken)
    if(AuthToken){
        const doc = await User.findOne({_id:id})
        if(doc){
            next();
        }else{
            res.redirect('http://localhost:3000')
        }    
    }else{
        res.redirect('http://localhost:3000')
    } 
}

export default AuthUser