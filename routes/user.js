
var express = require('express');
const { ObjectId, GridFSBucket } = require('mongodb');



var router = express.Router();

var session = express('session')

const { User, Admin, Login, Product, Cart, Wishlist, Order, Coupon, Category } = require('../config/connection');
const otp = require('../middleware/otp');


const razorpayPayment = require('../config/razorpay')
const Paypal = require('paypal-rest-sdk');
const { json } = require('express');
const e = require('express');
// router.get('/',(req,res) => {
//     res.render('User/home')
// })


let validation = ({
  coupon: false,
  couponUsed: false,
  couponMin: false,
  couponExpire: false,
})


//signup

router.get('/signup', (req, res) => {

  res.render('User/signup', {
    signerr: session.signErr,
    passerr: session.passErr
  })
  session.signErr = false;
  session.passErr = false
})


router.post('/signup', (req, res) => {
  User.findOne({ email: req.body.email })
    .then((result) => {
      if (result) {
        session.signErr = true;
        res.redirect('/signup')
      } else {
        var userData = new User({
          name: req.body.name,
          email: req.body.email,
          mobile: req.body.mobile,
          password: req.body.password,
          Block: false,
          detail: false
        })

        if (userData.password == req.body.reenterpassword) {
          userData.save()
            .then(() => {
              console.log('data inserted');
              res.redirect('/login')
              console.log(req.body);

            })
            .catch(() => {
              console.log('data not inserted');
              res.render('User/Singup')

            })
        } else {
          session.passErr = true
          res.redirect('/signup')
        }

      }
    })


})

//login

router.get('/login', (req, res) => {

  if (session.userlogin) {
    res.redirect('/')
  } else {
    res.render('User/login', {
      logginErr: session.logginErr,
      blocked: session.blocked,
    })
    session.logginErr = false;
    session.blocked = false;
  }
})




router.post('/login', (req, res, next) => {
  const loginData = req.body

  User.findOne({ email: loginData.email, password: loginData.password, Block: false })
    .then((result) => {
      if (result) {
        session.userlogin = true;
        session.userId = loginData.email
        console.log(session.userId);
        res.redirect("/")
      } else {

        User.findOne({ email: loginData.email, password: loginData.password, Block: true })
          .then((result) => {
            if (result) {
              console.log('blocked');
              session.blocked = true;
              res.redirect('/login')
            } else {
              console.log('invalid user');
              session.logginErr = true;
              res.redirect("/login");
            }

          })
          .catch((err) => {
            console.log(err)

          })

      }
    })

    .catch((err) => {
      console.log(err)

    })
})


//otp

router.get('/phone', (req, res) => {
  res.render('User/phone')
})

router.get('/otp', (req, res) => {
  res.render('User/otp')
})


router.post('/verifyOtp', (req, res) => {
  let otpObject = req.body
  otp.veriOtp(otpObject.otp, req.session.mobileNumber)
    .then((users) => {
      if (users) {
        res.redirect('/')
      } else {
        res.redirect('/otp')
      }
    })
    .catch((err) => {
      console.log(err);
    })
})


router.post('/sentotp', (req, res) => {
  console.log(req.body.mobile);
  User.findOne({ mobile: req.body.mobile })
    .then((user) => {
      if (user) {
        req.session.mobileNumber = req.body.mobile
        otp.sendOtp(req.body.mobile)
        res.redirect('/otp')
      } else {
        res.redirect()
      }
    })
})

// Home

router.get('/home', (req, res) => {
  res.redirect('/')
})


// view product



router.get('/', (req, res) => {
  let user = session.userId
  let cat = req.query.category
  console.log(cat);
  console.log(user);
 
      Wishlist.find({ userid: user })
        .then((wish) => {
          if(cat){
            Product.find({category:cat})
            .then((result) => {
            if(result){
            console.log('djkhlsfhjkhsd');
          
            res.render('User/home', { result, wish})
            }
          })
        }else{
          Product.find()
          .then((result) => {
          res.render('User/home', { result, wish })
          })
        }
         
        })
    
})



router.get('/homecat',(req,res) => {
  console.log('hello');
  res.send('hello')
})


// router.get('/', (req, res) => {
//     let user = session.userId
//     console.log(user);
//     Product.find({})
//       .then((result) => {
//         console.log(result);
//         Wishlist.find({ userid: user })
//           .then((wish) => {
//             for(let i=0;i<result.length;i++){

//                 for(let j=0;j<wish.length;j++){
//                   if(result[i]._id == wish[j].Productid){
//                   Product.findOneAndUpdate({_id:ObjectId(result[j]._id),wishlist:false},{$set:{Wishlist:true}})
//                   .then(() => {

//                   })
//                   }else{
//                     Product.findOneAndUpdate({_id:ObjectId(result[j]._id),wishlist:true},{$set:{Wishlist:false}})
//                     .then(() => {

//                     })
//                   }
//                 }

//             }


//               for(let i=0;i<result.length;i++){
//                 console.log(i);
//                 for(let j=0;j<wish.length;j++){
//                   console.log(j);
//                   if(result[i]._id == wish[j].Productid){
//                     Product.findOneAndUpdate({_id:ObjectId(result[i]._id),wishlist:false},{$set:{Wishlist:true}})
//                     .then((res) => {
//                       if(res){

//                       }else{
//                       console.log('sakdkjash');

//                       }
//                     })
//                   }else{

//                   }
//                 }
//               }



//             res.render('User/home', { result, wish })
//           })
//       })
//   })





// Product view Page

router.get('/productview', (req, res) => {
  let productID = req.query.id

  Product.findOne({ _id: ObjectId(productID), email: session.userId })
    .then((product) => {
      if (product) {
        console.log('ok');
        res.render('User/productview', { product })
      } else {
        res.send('A error Ocurre')
      }
    })
    .catch((err) => {
      console.log(err);
    })
})



// Cart 

router.get('/addto_cart:id', (req, res) => {
  const id = req.params.id



  if (session.userlogin && session.userId) {
    User.findOne({ email: session.userId }, { email: 1 })
      .then((docs) => {
        if (docs) {
          Cart.findOne({ Productid: id, userid: session.userId })
            .then((result) => {

              if (result) {
                let pro = +result.quantity + 1;
                Cart.findOneAndUpdate({ Productid: id, userid: session.userId }, { $set: { quantity: pro } })
                  .then((result) => {
                    if (result) {
                      res.redirect('/')
                    }
                  })
              } else {
                Product.findOne({ _id: ObjectId(id) }, { productName: 1, discountedPrice: 1, image1: 1, _id: 1 })
                  .then((result) => {
                    console.log('catred');


                    const cartdetails = new Cart({
                      userid: session.userId,
                      productName: result.productName,
                      price: result.discountedPrice,
                      image1: result.image1,
                      Productid: result._id,
                      quantity: 1,
                      totalprice: 0
                    })

                    cartdetails.save()

                      .then(() => {
                        console.log('cart added succesfully');
                        res.redirect('/')
                      })
                      .catch((err) => {
                        console.log(err);
                      })
                  })
              }
            })

        }
      })
  } else {
    res.redirect('/login')
  }
})

// view cart

router.get('/cart', (req, res) => {
  if (session.userlogin && session.userId) {
    let userId = session.userId

    Cart.find({ userid: userId })
      .then((docs) => {

        let finalAmount = 0
        let totalAmount = 0

        let count = docs.length
        for (let i = 0; i < docs.length; i++) {
          totalAmount = docs[i].price * docs[i].quantity
          finalAmount += totalAmount
        }

        const finalprice = finalAmount + 50

        res.render('User/cart', { docs, finalAmount, finalprice, count })
      })
      .catch((err) => {
        console.log(err);
      })
  } else {
    res.redirect('/login')
  }
})



// plus cart
router.get('/pluscart', (req, res) => {
  let prodtID = req.query.id
  let userId = session.userId
  Cart.findOne({ _id: ObjectId(prodtID), userid: userId })
    .then((result) => {
      if (result) {
        let count = +result.quantity + 1
        Cart.findOneAndUpdate({ _id: ObjectId(prodtID), userid: userId }, { $set: { quantity: count } })
          .then(() => {
            res.redirect('/cart')
          })

      } else {
        console.log(err);
      }

    })
    .catch((err) => {
      console.log(err);
    })
})


// minus cart

router.get('/minuscart', (req, res) => {
  let prodtID = req.query.id
  let userId = session.userId
  Cart.findOne({ _id: ObjectId(prodtID), userid: userId })
    .then((result) => {
      if (result) {
        let count = +result.quantity - 1
        if (count == 0) {
          Cart.findOneAndDelete({ _id: ObjectId(prodtID), userid: userId })
            .then(() => {
              res.redirect('/cart')
            })
        } else {

          Cart.findOneAndUpdate({ _id: ObjectId(prodtID), userid: userId }, { $set: { quantity: count } })
            .then(() => {
              res.redirect('/cart')
            })
        }
      } else {
        console.log(err);
      }

    })
    .catch((err) => {
      console.log(err);
    })

})


// delete cart

router.get('/delete_cart', (req, res) => {
  let proId = req.query.id
  let userId = session.userId
  Cart.findOneAndDelete({ _id: ObjectId(proId), userid: userId })
    .then((result) => {
      if (result) {
        res.redirect('/cart')
      } else {
        console.log(err);
      }
    })
    .catch((err) => {
      console.log(err);
    })
})



// Whislist


router.get('/wishlist:id', (req, res) => {
  const id = req.params.id

  console.log(id);
  console.log(session.userId);
  if (session.userlogin && session.userId) {
    User.findOne({ email: session.userId }, { email: 1 })
      .then((docs) => {
        if (docs) {


          Wishlist.findOne({ Productid: id, userid: session.userId })
            .then((result) => {

              if (result) {
                console.log('product is already added to wishlist');
                Wishlist.findOneAndDelete({ Productid: id, userid: session.userId })
                  .then(() => {
                    Product.findOneAndUpdate({ _id: ObjectId(id), userid: session.userId }, { $set: { Wishlist: false } })
                      .then(() => {
                        res.redirect('/')
                      })

                  })
                  .catch((err) => {
                    console.log(err);
                  })
              } else {
                Product.findOne({ _id: ObjectId(id) }, { productName: 1, discountedPrice: 1, image1: 1, _id: 1 })
                  .then(() => {
                    Product.findOneAndUpdate({ _id: ObjectId(id) }, { $set: { Wishlist: true } })
                      .then((result) => {
                        console.log('catred');
                        console.log(result);
                        const wishlistdetails = new Wishlist({
                          userid: session.userId,
                          productName: result.productName,
                          price: result.discountedPrice,
                          image1: result.image1,
                          Productid: result._id,
                          quantity: 1,
                          wishlist: true
                        })

                        wishlistdetails.save()

                      })

                      .then(() => {
                        console.log('cart added succesfully');
                        res.redirect('/')
                      })
                      .catch((err) => {
                        console.log(err);
                      })
                  })
              }


            })
        }
      })
  } else {
    res.redirect('/login')
  }
})


// view wishlist

router.get('/userwishlist', (req, res) => {
  if (session.userlogin && session.userId) {
    let userId = session.userId
    console.log(userId)
    Wishlist.find({ userid: userId })
      .then((docs) => {
        console.log('haii')

        console.log(docs)

        res.render('User/wishlist', { docs })
      })
      .catch((err) => {
        console.log(err);
      })
  } else {
    res.redirect('/login')
  }
})

// remove product from wishlist

router.get('/userhome/removewish', (req, res) => {
  let proId = req.query.id
  Wishlist.findOneAndDelete({ _id: ObjectId(proId), userid: session.userId })
    .then((result) => {
      if (result) {
        res.redirect('/userwishlist')
      } else {
        console.log(err);
      }

    })
    .catch((err) => {
      console.log(err);
    })
})


// Checkout

router.get('/checkout', (req, res) => {
  const usertId = session.userId
  console.log(validation);
  Cart.find({ userid: usertId })
    .then((result) => {
      console.log(result);
      let totalAmount = 0;
      let finalAmount = 0;
      for (let i = 0; i < result.length; i++) {
        totalAmount = result[i].price * result[i].quantity
        finalAmount += totalAmount
      }
      const finalprice = finalAmount;

      User.findOne({ email: usertId, detail: false })
        .then((docs) => {
          if (docs) {
            console.log(docs);
            console.log(result);
            res.render('User/address')

          } else {
            console.log(result);
            User.findOne({ email: usertId })
              .then((docs) => {
                console.log(docs);
                if (docs) {
                  res.render('User/checkout', { result, docs, totalAmount, finalAmount, validation })
                }
                validation.coupon = false,
                  validation.couponUsed = false,
                  validation.couponMin = false,
                  validation.couponExpire = false
              })


          }

        })


    })

})


// Checkout
router.post('/checkout', (req, res) => {
  let user = session.userId
  console.log('haiii');
  let j = +req.body.selectedAddress


  let paymentMethod = req.body.paymentType;

  let couponPrice = req.session.coupon;
  console.log(couponPrice);


  Cart.find({ userid: user })
    .then((result) => {
      if (result) {

        let totalAmount = 0;
        let finalAmount = 0;
        for (let i = 0; i < result.length; i++) {
          totalAmount = result[i].price * result[i].quantity
          finalAmount += totalAmount
        }
        let finalprice = finalAmount;
        console.log(finalprice);

        console.log(paymentMethod);

        User.findOne({ email: user })
          .then((docs) => {
            console.log(docs);
            console.log(j);
            if (paymentMethod == "cod") {
              let order = new Order({
                owner: user,
                items: result,
                address: {
                  name: docs.address[j].name,
                  mobile: docs.address[j].mobile,
                  address1: docs.address[j].address1,
                  address2: docs.address[j].address1,
                  city: docs.address[j].city,
                  state: docs.address[j].State,
                  zip: docs.address[j].zip
                },
                bill: finalprice,
                confirm: false,
                delivery: false,
                paymentMode: paymentMethod,
                orderDate: new Date(),
                orderStatus: 'processing'
              })
              order.save()

                .then((order) => {

                  console.log(order._id)
                  Cart.find({ userid: user })
                    .then((cart) => {
                      console.log('hjhjhjh');
                      let k = cart.length;
                      console.log(k);
                      for (let m = 0; m < k; m++) {
                        let quantity = cart[m].quantity;
                        console.log(quantity);
                        Product.findOne({ _id: ObjectId(cart[m].Productid) })
                          .then((pro) => {
                            let Stock = pro.stock;
                            Product.findOneAndUpdate({ _id: ObjectId(cart[m].Productid) }, { $set: { stock: Stock - quantity } })
                              .then(() => {
                                console.log("updated stock");
                              })
                          })
                      }
                    })


                  Cart.deleteMany({ userid: user })
                    .then(() => {

                      req.session.status = order._id
                      res.json({ codSuccess: true });
                    })
                    .catch((err) => {
                      console.log(err);
                    })
                })
            } else if (paymentMethod == "razorpay") {
              let order = new Order({
                owner: user,
                items: result,
                address: {
                  name: docs.address[j].name,
                  mobile: docs.address[j].mobile,
                  address1: docs.address[j].address1,
                  address2: docs.address[j].address1,
                  city: docs.address[j].city,
                  state: docs.address[j].State,
                  zip: docs.address[j].zip
                },
                bill: finalprice,
                confirm: false,
                delivery: false,
                paymentMode: paymentMethod,
                orderDate: new Date(),
                orderStatus: 'success'
              })
              order.save()
                .then((order) => {

                  console.log("generating rasorpay");
                  const totalAmount = finalprice;
                  razorpayPayment.generateRazorpay(totalAmount).then((order) => {
                    console.log(order);
                    Cart.find({ userid: user })
                      .then((cart) => {
                        console.log('hjhjhjh');
                        let k = cart.length;
                        console.log(k);
                        for (let m = 0; m < k; m++) {
                          let quantity = cart[m].quantity;
                          console.log(quantity);
                          Product.findOne({ _id: ObjectId(cart[m].Productid) })
                            .then((pro) => {
                              let Stock = pro.stock;
                              Product.findOneAndUpdate({ _id: ObjectId(cart[m].Productid) }, { $set: { stock: Stock - quantity } })
                                .then(() => {
                                  console.log("updated stock");
                                })
                            })
                        }
                      })

                    Cart.deleteMany({ userid: user })
                      .then(() => {
                        console.log('gjhgjhg');

                        req.session.status = order._id
                        res.json({ order, razorpay: true });
                      })
                      .catch((err) => {
                        console.log(err);
                      })

                  });
                })
            } else if (paymentMethod == "paypal") {
              let order = new Order({
                owner: user,
                items: result,
                address: {
                  name: docs.address[j].name,
                  mobile: docs.address[j].mobile,
                  address1: docs.address[j].address1,
                  address2: docs.address[j].address1,
                  city: docs.address[j].city,
                  state: docs.address[j].State,
                  zip: docs.address[j].zip
                },
                bill: finalprice,
                confirm: false,
                delivery: false,
                paymentMode: paymentMethod,
                orderDate: new Date(),
                orderStatus: 'processing'
              })
              order.save()
                .then((order) => {


                  const totalAmount = result.bill;
                  console.log("working on generating the paypaal");
                  const orderid = 123456;
                  console.log(totalAmount);
                  req.session.status = order._id
                  res.json({ paypal: true });

                })
            }



          })






      }


    })


})

router.get('/payment/paypal', (req, res) => {
  let billAmount = Order.findOne({ owner: session.userId })
    .then((order) => {
      return order.bill;
    })
  billAmount.then((bill) => {
    bill = Math.round(+bill * 0.01368)
    console.log(bill);

    Paypal.configure({
      'mode': 'sandbox', //sandbox or live 
      'client_id': 'AXO3kN5P9x-0TYzO06OVSawpde3WMLwiv_czU2c3KdVks5qkvg_TI5po3BLaCwfjN5hc4sbZYvTkI-n9',
      // please provide your client id here 
      'client_secret': 'EKq_3bxd_PTGt6ul6Y4ZaN5TInOXA-50OH0KhpMXoWq3a_4Pj1nlDg1LsMwFwTqxnisc3O1jFiV1jdXj' // provide your client secret here 
    });

    // create payment object 
    let payment = {
      "intent": "authorize",
      "payer": {
        "payment_method": "paypal"
      },
      "redirect_urls": {
        "return_url": 'http://localhost:5000/orderSuccess',
        "cancel_url": "http://127.0.0.1:3000/err"
      },
      "transactions": [{
        "amount": {
          "total": `${+bill}`,
          "currency": "USD"
        },
        "description": " a book on mean stack "
      }]
    }

    let createPay = (payment) => {
      return new Promise((resolve, reject) => {
        Paypal.payment.create(payment, function (err, payment) {
          if (err) {
            reject(err);
          }
          else {
            resolve(payment);
          }
        });
      });
    }

    // call the create Pay method 
    createPay(payment)
      .then((transaction) => {
        console.log(transaction)
        var id = transaction.id;
        var links = transaction.links;
        var counter = links.length;
        while (counter--) {
          if (links[counter].method == 'REDIRECT') {
            // console.log(transaction);
            // redirect to paypal where user approves the transaction 
            return res.redirect(links[counter].href)
          }
        }
      })
      .catch((err) => { -
        console.log(err);
        res.redirect('/err');
      });


  })
})



// 

router.get('/orderSuccess', (req, res) => {
  let status = req.session.status
  Order.findOneAndUpdate({ _id: ObjectId(status) }, { $set: { orderStatus: 'success' } })
    .then(() => {
      res.render('User/orderSuccess')
    })
    .catch((err) => {
      console.log(err);
    })
})


router.get('/success', (req, res) => {
  let status = req.session.status
  Order.findOneAndUpdate({ _id: ObjectId(status) }, { $set: { orderStatus: 'success' } })
    .then(() => {
      res.redirect('/')
    })
    .catch((err) => {
      console.log(err);
    })
})

//  Address

router.post('/address', (req, res) => {
  let userId = session.userId
  User.findOneAndUpdate({ email: userId }, {
    $set: {
      address: [{
        name: req.body.name,
        mobile: req.body.mobile,
        address1: req.body.address1,
        address2: req.body.address2,
        city: req.body.city,
        state: req.body.State,
        zip: req.body.zip
      }],
      detail: true
    }
  })
    .then(() => {
      res.redirect('/checkout')
    })
    .catch((err) => {
      console.log(err);
    })
})

// order Details





//  new address
router.get('/newAddress', (req, res) => {
  res.render('User/newAddress')
})


router.post('/newAddress', (req, res) => {
  let userId = session.userId
  User.findOneAndUpdate({ email: userId }, {
    $push: {
      address: [{
        name: req.body.name,
        mobile: req.body.mobile,
        address1: req.body.address1,
        address2: req.body.address2,
        city: req.body.city,
        state: req.body.State,
        zip: req.body.zip
      }]
    },
    detail: true
  })
    .then(() => {
      res.redirect('/checkout')
    })
    .catch((err) => {
      console.log(err);
    })
})


// Profile

router.get('/myAccount', (req, res) => {
  let user = session.userId;
  if (session.userlogin && session.userId) {
    User.findOne({ email: user })
      .then((docs) => {
        if (docs) {
          res.render('User/profile', { docs })
        }
        else {
          res.redirect('/login')
        }
      })
      .catch((err) => {
        console.log(err);
      })
  } else {
    res.redirect('/login')
  }

})

//  order

router.get('/myOrder', (req, res) => {
  let user = session.userId
  if (session.userlogin && session.userId) {
    Order.find({ owner: user, orderStatus: 'success' })
      .then((docs) => {
        console.log(docs);
        if (docs) {
          res.render('User/order', { docs })
        } else {
          console.log(err);
        }

      })
      .catch((err) => {
        console.log(err);
      })
  } else {
    res.redirect('/login')
  }
})

// Order view

router.get('/myOrdersView', (req, res) => {
  const proId = req.query.id;
  const user = session.userId
  console.log(proId);
  console.log(user);
  Order.findOne({ _id: ObjectId(proId) })
    .then((docs) => {
      if (docs) {

        let items = docs.items
        let v = items.length
        console.log(items);
        console.log(v);
        res.render('User/orderview', { docs, items, v })
      } else {
        console.log(err);
      }
    })
    .catch((err) => {
      console.log(err);
    })
})


// cancel Order

router.get('/cancelorder', (req, res) => {
  const proId = req.query.id
  const user = session.userId
  Order.findOneAndUpdate({ _id: ObjectId(proId) }, { $set: { cancel:true } })
    .then(() => {
      res.redirect('/myOrder')
    })
    .catch((err) => {
      console.log(err);
    })
})

router.get('/returnorder', (req, res) => {
  const proId = req.query.id
  const user = session.userId
  Order.findOneAndUpdate({ _id: ObjectId(proId) }, { $set: { return:true } })
    .then(() => {
      res.redirect('/myOrder')
    })
    .catch((err) => {
      console.log(err);
    })
})



//  coupon



router.post('/apply_coupon', (req, res) => {
  let user = session.userId
  let couponId = req.body.couponId
  let totalPrice = req.body.totalPrice
  console.log(user);
  console.log(couponId);
  console.log(totalPrice);


  Coupon.findOne({ couponcode: couponId })
    .then((cpn) => {
      if (cpn) {


        console.log(cpn);
        let value = cpn.couponvalue
        console.log(value);
        req.session.coupon = totalPrice - value
        console.log(req.session.coupon);
        console.log('hgjadjhfgsjdgh');
        console.log(cpn);
        if (cpn) {
          Coupon.findOne({ couponcode: couponId, User: { $elemMatch: { userid: user } } })
            .then((docs) => {
              if (docs) {

                validation.couponUsed = true;

                console.log('This coupon is already used');
                res.json({ Validation: true })
              } else {

                Coupon.findOne({ couponcode: couponId })
                  .then((result) => {
                    console.log(result);
                    let CD = Date.now()
                    if (CD > result.startdate && CD < result.expirydate) {



                      if (result.minbill < totalPrice) {
                        const count = result.length
                        let couponDiscountedBill = totalPrice - result.couponvalue;
                        console.log(couponDiscountedBill);

                        req.session.coupon = +result.couponvalue
                        console.log(req.session.coupon);

                        Coupon.findOneAndUpdate({ couponcode: couponId }, { $push: { User: { userid: user } } })
                          .then(() => {
                            res.json({ change: true, couponDiscountedBill })
                          })
                          .catch((err) => {
                            console.log(err);
                          })


                      } else {
                        validation.couponMin = true
                        console.log('minimum value of coupon is not');
                        res.json({ Validation: true })
                      }


                    } else {
                      validation.couponExpire = true
                      console.log('coupon is expired');
                      res.json({ Validation: true })
                    }
                  })
              }
            })
        }
      } else {

        validation.coupon = true;
        console.log('coupon code is incorrect');
        console.log(validation);
        res.json({ Validation: true })
      }
    })
    .catch((err) => {
      console.log(err);
    })


})



router.post('/couponverify', (req, res) => {
  let price = req.body.finalPrc
  console.log('jkljkljlkjk');
  console.log(price);
})







// Logout

router.get('/logout', (req, res, next) => {
  session.userlogin = false;
  res.redirect('/login')
})





// Home

// router.get('/home',(req,res) => {
//   res.redirect('/')
// })








module.exports = router;