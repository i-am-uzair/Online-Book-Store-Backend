import express from "express";

import userController from "../controller/userController.js";
import booksController from "../controller/booksController.js";

const router = express.Router();

// router.post('/Registration',userController.userRegistration)




// for pdf purpose
import multer from "multer";
import AuthUser from "../middleware/AuthMiddleware.js";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './files')
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now()
      cb(null, uniqueSuffix+file.originalname)
    }
  })
  
  const upload = multer({ storage: storage })
  
  // user related routes
  // router.use(AuthUser)

  router.post('/Registration',AuthUser,userController.userRegistration)
  router.get('/verify/:token',userController.userVerification)
  router.post('/login',AuthUser,userController.loginUser)
  
  // books related routes
  router.post('/upload-files',upload.single('file'),booksController.uploadBook)
  router.get('/books',booksController.getAllBooks)
  router.get('/books/:id',booksController.getSingleBook)

  
  
  // testing only 
  // for testing purpose routes
router.get('/testing',async(req,res)=>{
  res.redirect('http://localhost:3000')
  req.cookies
})

export default router;