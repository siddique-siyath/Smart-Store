const { json } = require('express');
const Razorpay = require('razorpay');
var instance = new Razorpay({
    key_id: "rzp_test_VxysCuDTLKCRBt",
    key_secret:"Sbx3ro0wafbZkHR7YAflhW8S",
  });

module.exports = {
    

  generateRazorpay: (totalAmount) => {
    orderid=1234567
    return new Promise((res, rej) => {
      console.log("amount is " + totalAmount);

      var options = {
        amount: totalAmount *100, 
        currency: "INR",
        receipt:orderid
      };
 
      console.log("options"+ options)
      instance.orders.create(options, function(err, order) {
        if(err){
          console.log(err)
        }else{
         
           console.log(order);
         res(order)
        }
    })
    })
  },
};