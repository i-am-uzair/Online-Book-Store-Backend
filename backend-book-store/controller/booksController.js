import path from "path"
import { books } from "../models/books.js"
import fs from 'fs/promises'

class booksController{

    // uploading the new book
    static async uploadBook(req,res){
        const {title,Author,category,ISBN,price,url,Desc} = req.body
        const {filename} = req.file
        // console.log(req.body)
        // console.log(req.file.filename)
        if(title && Author && category && ISBN && price && url && Desc){
            const AdminBook = await books.findOne({ISBN:ISBN})
            if(AdminBook){
                res.status(200).json({message:"Already have a book with this ISBN",status:false})
            }else{
                console.log(url)
                const doc = new books({
                    BookName:title,
                    Author:Author,
                    Bookcategory:category,
                    ISBN:ISBN,
                    PDF:filename,
                    Price:price,
                    url:url,
                    // Stock:qty,
                    Desc:Desc
                })

                const result = await doc.save()
                res.json({result,message:"book added in your store",status:true})
            }
        }else{
            res.status(400).json({message:"all fileds are required",status:false})
        }

     }


    //  get all the books
    static async getAllBooks(req,res){
        const doc = await books.find({}).select('-PDF')
        res.send(doc)
    }
    
    //  get the single book 
    static async getSingleBook(req,res){
        const {id} = req.params
        if(id.length >=16){
            const doc = await books.findOne({_id:id},).select('-PDF')
            if(doc){
                res.send(doc)
            }else{
                res.status(204).json({message:"No book found"})
            }
        }else if(id){
            const doc2 = await books.findOne({ISBN:id},).select('-PDF')
            if(doc2){
                res.send(doc2)
            }
        }
        else{
            res.status(200).json({message:"error in book id"})
        }
    }

    static async updateBook(req,res){
        try {
            const {title,ISBN,category,qty,Desc,price, Author,url} = req.body
            const {originalname} = req.file
            
            if(title && Author && ISBN && category && qty && Desc && price && originalname && url){
            //   console.log(url)
              const doc = await books.findOne({ISBN:ISBN})
              // console.log(doc)
              if(doc){
                // console.log(doc.PDF)
                console.log("udate ",url)
                const updatePdf = await fs.rename(path.resolve(`./files/${doc.PDF}`),path.resolve(`./files/${originalname}`))
                // console.log(updatePdf)
                const update = {
                    BookName:title,
                    Author:Author,
                    Bookcategory:category,
                    ISBN:ISBN,
                    PDF:originalname,
                    Price:price,
                  //   Stock:qty,
                    Desc:Desc,
                    url:url
                }
                const updateBook = await books.updateOne({ISBN:ISBN},update,{new:true})
        
                res.json({message:"item updated",updateBook,status:true})
                // console.log(updateBook)
              }else{
                res.json({message:"there is no book available on this ISBN",status:false})
              }
            }else{
              res.json({message:"All fileds are required",status:false})
            } 
          } catch (error) {
            console.log("something went wrong ",error)
          }
    }

    static async removeBook(req,res){
        const {BookName,BookISBN} = req.body
        if(BookName && BookISBN){
            
            // const updatePdf = await fs.rename(path.resolve(`./files/${doc.PDF}`),path.resolve(`./files/${originalname}`))
            const result = await books.findOneAndDelete({ISBN:BookISBN})
            if(result){
                res.json({message:"book deleted",status:true})
                const deleteBook = await fs.rm(path.resolve(`./files/${result.PDF}`))
            }else{
                res.json({message:"there is no book available on this ISBN",status:false})
            }
        }else{
            res.json({message:"All fileds are required",status:false})
        }
    }
}

export default booksController