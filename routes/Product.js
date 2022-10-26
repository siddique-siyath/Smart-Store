
var express = require('express');

const { ObjectId } = require('mongodb');


var router = express.Router();

var session = express('session')

const { User, Admin, Login, Product, Category } = require('../config/connection')




const store = require('../config/multer')


// Add Product

router.get('/', (req, res) => {
  Category.find()
    .then((category) => {
      console.log(category);
      res.render('Admin/addProduct', { category })
    })

})

router.post('/', store.any(), (req, res, next) => {
  const files = req.files;

  if (!files) {
    const error = new Error('Please choose file')
    error.httpStatusCode = 400
    return next(error)
  }
  let productDetail = new Product({
    productName: req.body.productName,
    actualPrice: req.body.actualPrice,
    discountedPrice: req.body.discountedPrice,
    description: req.body.description,
    category: req.body.category,
    stock: req.body.stock,
    image1: req.files[0] && req.files[0].filename ? req.files[0].filename : "",
    image2: req.files[1] && req.files[1].filename ? req.files[1].filename : "",
    Wishlist: false
  })

  productDetail.save()
    .then(() => {
      res.redirect('/Product')
    })
    .catch((error) => {
      console.log(error)
    })
})

router.get("admin/viewproduct/category", (req, res) => {
  res.render('Admin/category')
})

// Add Product

module.exports = router;
