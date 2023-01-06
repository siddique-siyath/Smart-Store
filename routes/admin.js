const { JSONCookie } = require('cookie-parser');

var express = require('express');

const { ObjectId } = require('mongodb');
const { isObjectIdOrHexString } = require('mongoose');


var router = express.Router();

var session = express('session')

const { User, Admin, Login, Product, Category, Order, Coupon } = require('../config/connection')


const store = require('../config/multer')

const ExcelJS = require('exceljs');


//  Admin Login


router.get('/', (req, res) => {

  if (session.adminlogin) {

    res.render('Admin/home')
  }
  else {

    res.render('Admin/adminlogin', { adminerr: session.adminloginerr })
    session.adminloginerr = false;
  }
})



router.post('/', (req, res) => {

  const admindata = req.body
  Admin.findOne({ email: admindata.email, password: admindata.password })
    .then((result) => {
      if (result) {

        session.adminlogin = true;

        res.render('Admin/home')

      } else {
        console.log('error`');
        session.adminloginerr = true
        res.render('Admin/adminlogin', { adminerr: session.adminloginerr })

      }
    })

    .catch((err) => {
      console.log(err);
      session.adminloginerr = true
      res.render('Admin/adminlogin', { adminerr: session.adminloginerr })

      console.log('admin not login');
    })
})



// User Details


router.get('/userdetails', (req, res) => {

  User.find()
    .then((docs) => {
      const num = 1;
      if (docs)
        res.render('Admin/userDetails', { docs, num })
    })
    .catch((err) => {
      console.log(err);
    })
})




//blocke And unblock



router.post('/block:id', (req, res) => {
  let userId = req.params.id
  console.log(userId)
  User.updateOne({ _id: ObjectId(userId) }, { $set: { Block: true } })
    .then(() => {
      console.log("blocked");
      res.redirect('/admin/userdetails')
    })
    .catch((err) => {
      console.log(err);
    })


});



router.post('/unblock:id', (req, res) => {
  let userId = req.params.id
  console.log(userId)
  User.updateOne({ _id: ObjectId(userId) }, { $set: { Block: false } })
    .then(() => {
      console.log("unblocked");
      res.redirect('/admin/userdetails')
    })
    .catch((err) => {
      console.log(err);
    })

})



//product view

router.get('/viewproduct', (req, res) => {

  Product.find()
    .then((product) => {
      console.log(product);
      const num = 1;
      if (product)
        res.render('Admin/viewProduct', { product, num })

    })
    .catch((err) => {
      console.log(err);
    })
})


// Delete Product

router.get('/delete_product', (req, res) => {
  let productId = req.query.id
  console.log(productId);
  Product.deleteOne({ _id: ObjectId(productId) })
    .then((result) => {
      if (result) {
        res.redirect('/admin/viewproduct')
      } else {
        console.log(err);
      }
    })
    .catch((err) => {
      console.log(err);
    })

})


// Edit Product

router.get('/edit_product', (req, res) => {
  let productId = req.query.id
  console.log(productId);
  Product.findOne({ _id: ObjectId(productId) })
    .then((result) => {
      if (result) {
        res.render('Admin/edit_Product', { result })
      } else {
        console.log(err);
      }
    })
    .catch((err) => {
      console.log(err);
    })

})



router.post('/edit_product', store.any(), (req, res, next) => {
  let updateID = req.query.id
  console.log('haiiii..', req.body)
  console.log(updateID)
  console.log(req.files);
  Product.updateOne({ _id: ObjectId(updateID) }, {
    $set: {
      productName: req.body.productName,
      actualPrice: req.body.actualPrice,
      discountedPrice: req.body.discountedPrice,
      description: req.body.description,
      category: req.body.category,
      stock: req.body.stock,
      image1: req.files[0] && req.files[0].filename ? req.files[0].filename : "",
      image2: req.files[1] && req.files[1].filename ? req.files[1].filename : "",
      Wishlist: false,
    }
  })
    .then((result) => {
      if (result) {
        console.log('Updated');
        res.redirect('/admin/viewproduct')

      } else {
        console.log(err);
      }

    })
    .catch((err) => {
      console.log(err);
    })
})


// home

router.get('/home', (req, res) => {
  res.render('Admin/home')
})


// Category

router.get("/addcategory", (req, res) => {
  res.render('Admin/addcategory')
})

router.post("/add_category", (req, res) => {
  let category = new Category({
    name: req.body.name
  })
  category.save()
    .then(() => {
      res.redirect('/admin/addcategory')
    })
    .catch((err) => {
      console.log(err);
    })
})


// view category

router.get("/view_Category", (req, res) => {
  Category.find()
    .then((result) => {
      res.render('Admin/category_view', { result })
    })
})


// Edit category





router.get("/edit_category", (req, res) => {
  let category = req.query.id
  Category.findOne({ _id: ObjectId(category) })
    .then((result) => {
      if (result) {
        res.render('Admin/edit_category', { result })
      } else {
        console.log(err);
      }
    })
    .catch((err) => {
      console.log(err);
    })
})

router.post("/edit_category:id", (req, res) => {
  let prodId = req.params.id
  console.log(prodId);
  Category.findOneAndUpdate({ _id: ObjectId(prodId) }, { $set: { name: req.body.name } })
    .then((result) => {
      if (result) {
        res.redirect('/admin/view_Category')
      } else {
        console.log(err);
      }
    })
    .catch((err) => {
      console.log(err);
    })
})


//  delete category


router.get('/delete_category', (req, res) => {
  let proId = req.query.id
  Category.findOneAndDelete({ _id: ObjectId(proId) })
    .then(() => {
      res.redirect('/admin/view_Category')
    })
    .catch((err) => {
      console.log(err);
    })
})


//  order

router.get('/orders', (req, res) => {
  Order.find({ confirm: false,cancel:false,return:false })
    .then((result) => {
      if (result) {
        console.log(result);
        res.render('Admin/order', { result })
      } else {
        console.log(err);
      }
    })
    .catch((err) => {
      console.log(err);
    })
})


// confirm order

router.get('/confirmed', (req, res) => {
  Order.find({ confirm: true, delivery: false,cancel:false,return:false })
    .then((result) => {
      if (result) {
        res.render('Admin/orderConfirm', { result })
      } else {
        console.log(err);
      }
    })
    .catch((err) => {
      console.log(err);
    })
})


router.get('/confirm', (req, res) => {
  let proId = req.query.id
  console.log(proId);
  Order.findOneAndUpdate({ _id: ObjectId(proId) }, { $set: { confirm: true } })
    .then((result) => {
      if (result) {
        res.redirect('/admin/orders')
      }
    })
})

// order delivery

router.get('/delivered', (req, res) => {
  Order.find({ delivery: true,cancel:false,return:false })
    .then((result) => {
      if (result) {
        res.render('Admin/orderDelivery', { result })
      } else {
        console.log(err);
      }
    })
    .catch((err) => {
      console.log(err);
    })
})


router.get('/delivery', (req, res) => {
  let proId = req.query.id
  console.log(proId);
  Order.findOneAndUpdate({ _id: ObjectId(proId) }, { $set: { delivery: true } })
    .then((result) => {
      if (result) {
        res.redirect('/admin/confirmed')
      }
    })
})


router.get('/cancel', (req, res) => {
  Order.find({ cancel:true })
    .then((result) => {
      if (result) {
        res.render('Admin/cancel_order', { result })
      } else {
        console.log(err);
      }
    })
    .catch((err) => {
      console.log(err);
    })
})


router.get('/return', (req, res) => {
  Order.find({ return:true })
    .then((result) => {
      if (result) {
        res.render('Admin/return_order', { result })
      } else {
        console.log(err);
      }
    })
    .catch((err) => {
      console.log(err);
    })
})



// view Order


router.get('/vieworder', (req, res) => {
  let ProId = req.query.id
  Order.find({_id:ObjectId(ProId)})
    .then((docs) => {
      if (docs) {
        res.render('Admin/order_view', { docs })
      } else {
        console.log(err);
      }
    })
    .catch((err) => {
      console.log(err);
    })
})





router.get('/back_confirm', (req, res) => {
  let proId = req.query.id
  console.log(proId);
  Order.findOneAndUpdate({ _id: ObjectId(proId) }, { $set: { confirm: false } })
    .then((result) => {
      if (result) {
        res.redirect('/admin/confirmed')
      }
    })
})


router.get('/back_delivery', (req, res) => {
  let proId = req.query.id
  console.log(proId);
  Order.findOneAndUpdate({ _id: ObjectId(proId) }, { $set: { delivery: false } })
    .then((result) => {
      if (result) {
        res.redirect('/admin/delivered')
      }
    })
})


router.get('/vieworder', (req, res) => {
  let order = req.query.id
  const user = session.userId
  console.log(order);
  Order.findOne({ _id: ObjectId(order) })
    .then((result) => {
      if (result) {
        res.render('Admin/user_order_view', { result })
      } else {
        console.log(err);
      }
    })
    .catch((err) => {
      console.log(err);
    })
})


//  coupon

router.get('/coupon', (req, res) => {
  Coupon.find()
    .then((result) => {
      if (result) {
        res.render('Admin/coupon', { result })
      } else {
        console.log(err);
      }
    })
    .catch((err) => {
      console.log(err);
    })

})


router.post('/add-coupen', (req, res) => {
  let coupon = new Coupon({
    couponcode: req.body.couponcode,
    couponvalue: req.body.couponvalue,
    minbill: req.body.minbill,
    startdate: req.body.startdate,
    expirydate: req.body.expirydate
  })
  coupon.save()
    .then(() => {
      res.redirect('/admin/coupon')
    })
    .catch((err) => {
      console.log(err);
    })
})



router.post('/delete-coupon', (req, res) => {
  let proId = req.query.id
  Coupon.findOneAndDelete({ _id: ObjectId(proId) })
    .then(() => {
      res.redirect('/admin/coupon')
    })
    .catch((err) => {
      console.log(err);
    })
})


//  dash Board

router.post('/test', (req, res) => {

  const months = [
    january = [],
    february = [],
    march = [],
    april = [],
    may = [],
    june = [],
    july = [],
    august = [],
    september = [],
    october = [],
    november = [],
    december = []
  ]

  const quarters = [
    Q1 = [],
    Q2 = [],
    Q3 = [],
    Q4 = []
  ]

  const monthNum = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]

  Order.find({ delivery: true })
    .then((orders) => {
      monthNum.forEach((month, monthIndex) => {
        orders.forEach((order, index) => {
          if (order.orderDate.getMonth() + 1 == monthIndex + 1) {
            months[monthIndex].push(order);
          }
        })
      })

      orders.forEach((order) => {
        if (order.orderDate.getMonth() + 1 <= 3) {
          quarters[0].push(order)
        } else if (order.orderDate.getMonth() + 1 > 3 && order.orderDate.getMonth() + 1 <= 6) {
          quarters[1].push(order)
        } else if (order.orderDate.getMonth() + 1 > 6 && order.orderDate.getMonth() + 1 <= 9) {
          quarters[2].push(order)
        } else if (order.orderDate.getMonth() + 1 > 9 && order.orderDate.getMonth() + 1 <= 12) {
          quarters[3].push(order)
        }
      })

      const monthlySalesTurnover = [];
      const quarterlySalesTurnover = [];
      months.forEach((month) => {
        let eachMonthTurnover = month.reduce((acc, curr) => {
          acc += +curr.bill;
          return acc;
        }, 0)
        monthlySalesTurnover.push(eachMonthTurnover);
      })

      quarters.forEach((quarter) => {
        let eachQuarterTurnover = quarter.reduce((acc, curr) => {
          acc += curr.bill;
          return acc;
        }, 0)
        quarterlySalesTurnover.push(eachQuarterTurnover)
      })

      let annualSales = orders.reduce((acc, curr) => {
        acc += curr.bill
        return acc;
      }, 0)

      res.json({ salesOfTheYear: monthlySalesTurnover, quarterlySales: quarterlySalesTurnover, annualSales: annualSales })
    })
})




//  exel download


router.get("/exportExcel", (req, res) => {
  Order.find({ delivery: true })
    .then((SalesReport) => {


      console.log(SalesReport)
      try {
        const workbook = new ExcelJS.Workbook();

        const worksheet = workbook.addWorksheet("Sales Report");

        worksheet.columns = [
          { header: "S no.", key: "s_no" },
          { header: "OrderID", key: "_id" },
          { header: "Date", key: "orderDate" },
          { header: "Products", key: "productName" },
          { header: "Method", key: "paymentMode" },
          { header: "status", key: "orderStatus" },
          { header: "Amount", key: "bill" },
        ];
        let counter = 1;
        SalesReport.forEach((report) => {
          report.s_no = counter;
          report.productName = "";

          // report.name = report.userid;
          report.items.forEach((eachproduct) => {
            report.productName += eachproduct.productName + ", ";
            //  console.log(report.Product);
          });
          worksheet.addRow(report);
          counter++;
        });

        worksheet.getRow(1).eachCell((cell) => {
          cell.font = { bold: true };
        });


        res.header(
          "Content-Type",
          "application/vnd.oppenxmlformats-officedocument.spreadsheatml.sheet"
        );
        res.header("Content-Disposition", "attachment; filename=report.xlsx");

        workbook.xlsx.write(res);
      } catch (err) {
        console.log(err.message);
      }
    });
});















// Add Product




// router.get('/admin/viewproduct', (req, res) => {
//   res.render('Admin/viewProduct')
// })


// router.get("/adminlogout", (req, res) => {
//   session.adminlogin = false
//   res.render('Admin/adminlogin')
// })






// Logout


router.get('/adminlogout', (req, res, next) => {
  console.log("logoyut");
  session.adminlogin = false;
  res.redirect('/admin')
})


module.exports = router;