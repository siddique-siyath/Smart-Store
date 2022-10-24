const path =require('path')

const multer= require('multer')

   
let storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null,'public/images')
    },
    filename: function (req, file, cb) {
    let ext=path.extname(file.originalname)
      cb(null, Date.now() + ext)
    }
  })
  

store=multer({storage:storage})
module.exports=store