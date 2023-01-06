const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const hbs = require('express-handlebars');


const mongoose = require("mongoose");



var session = require('express-session');


const userRouter = require('./routes/user');  
const adminRouter = require('./routes/admin');
const productRouter = require('./routes/Product')



var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/uploads',express.static('upload'))

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({secret:"key",resave:false,saveUninitialized:true,cookie:{maxAge:600000}}));

mongoose.connect('mongodb://127.0.0.1:27017/meracart').then(() => {
  console.log('Database connected')
  
}).catch(() => {
  console.log('db not connected');
})



app.use(function(req,res,next){
  res.set('cache-control','no-cache , no-store,must-revalidate,max-stale=0,post-check=0,pre-checked=0');
  next();
});



app.use('/', userRouter);
app.use('/admin', adminRouter);
app.use('/Product', productRouter)



app.use(function(req,res){
  res.status(404).render('User/404Page.ejs');
});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
