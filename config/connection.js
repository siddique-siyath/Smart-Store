const { OrderedBulkOperation } = require('mongodb')
const mongoose = require('mongoose')

const Schema = mongoose.Schema

// user

const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    mobile: {
        type: Number,
        required: true
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 4,
        maxlength: 10
    },
    Block: {
        type: Boolean
    },
    detail: {
        type: Boolean
    },
    address: [{
        name: {
            type:String,
            required:true
        },
        mobile:{
            type:String,
            required:true
        },
        address1:{
            type:String,
            required:true
        },
        address2:{
            type:String,
            required:true
        },
        city:{
            type:String,
            required:true
        },
        State:{
            type:String,
            required:true
        },
        zip:{
            type:String,
            required:true
        }
    }],
}, { timestamps: true })



const loginSchema = new Schema({

    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 4,
        maxlength: 10
    }
}, { timestamps: true })



// admin

const adminSchema = new mongoose.Schema({
    email: String,
    password: String
})



// Product


const ProductSchema = new Schema({
    productName: {
        type: String,
        required: true
    },
    actualPrice: {
        type: String,
        required: true
    },
    discountedPrice: {
        type: String,
        required: true
    },

    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    stock: {
        type: String,
        require: true
    },
    image1: {
        type: String,
        required: true
    },
    image2: {
        type: String,
        required: true
    },
    Wishlist: {
        type: String,
        required: true
    }
}, { timestamps: true })





// Cart

const CartSchema = new Schema({
    userid: {
        type: String,
        required: true
    },
    productName: {
        type: String,
        required: true
    },
    quantity: {
        type: String,
        required: true
    },
    price: {
        type: String,
        required: true
    },
    image1: {
        type: String,
        required: true
    },

    Productid: {
        type: String,
        required: true
    }
})



// Wishlist


const WishlistSchema = new Schema({
    userid: {
        type: String,
        required: true
    },
    productName: {
        type: String,
        required: true
    },
    quantity: {
        type: String,
        required: true
    },
    price: {
        type: String,
        required: true
    },
    image1: {
        type: String,
        required: true
    },

    Productid: {
        type: String,
        required: true
    },
    wishlist: {
        type: String,
        required: true
    }
})



// Category

const CategorySchema = new Schema({
    name: {
        type: String,
        required: true
    }
})


// Order

const orderSchema = new Schema({
    owner : {
        type: String,
        required : true
       },
       items : [{
        
       }],
       address :{
        name : { type : String },
        mobile : { type : String },
        address1 : { type : String},
        address2 : { type : String},
        city : { type : String },
        state : { type : String },
        zip : { type : String } 
       },
       bill : {
        type : Number,
        required : true,
        
       },
       paymentMode :{
        type : String,
        required : true
       },
       orderDate : {
            type :Date,
            required : true 
       },
       orderStatus : {
            type : String,
            required : true
            
       },
       confirm:{
        type:String,
        required:true
       },
       delivery:{
        type:String,
        required:true
       },
       cancel:{
        type:String,
        default:false,
        require:true
       },
       return:{
        type:String,
        default:false,
        require:true
       }
    },{timestamps:true})


//  Coupon

const couponSchema = new Schema ({
    couponcode:{
        type:String,
        required:true
    },
    couponvalue:{
        type:Number,
        required:true
    },
    minbill:{
        type:Number,
        required:true
    },
    startdate:{
        type:Date,
        required:true
    },
    expirydate:{
        type:Date,
        require:true
    },
    User:[{
        userid:{
        type:String,
        required:true,
    }
}]
})



const User = mongoose.model('User', userSchema)
const Login = mongoose.model('Login', loginSchema)
const Admin = mongoose.model('Admin', adminSchema)
const Product = mongoose.model('Product', ProductSchema)
const Cart = mongoose.model('Cart', CartSchema)
const Wishlist = mongoose.model('Whislist', WishlistSchema)
const Category = mongoose.model('Category', CategorySchema)
const Order = mongoose.model('Order',orderSchema)
const Coupon = mongoose.model('Coupon',couponSchema)

module.exports = { User, Admin, Login, Product, Cart, Wishlist, Category ,Order,Coupon};


