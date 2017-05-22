var express = require('express');
var path = require('path');
var bodyParser = require("body-parser");
var mammoth = require("mammoth");
var multer = require("multer");
var session = require('express-session');
var passport = require('passport');
var mongoose = require('mongoose');
var cookieParser = require('cookie-parser');
var expressValidator = require('express-validator');
var flash = require('connect-flash');

//start app
var app = express();
var admin = express();

var routes = require('./routes/index');
var writers = require('./routes/controller');
var root = __dirname;


//connect to database
mongoose.connect("mongodb://localhost:27017/dailypost", function(error){
  if(error){
    console.log("Database not connected");
  }else{
    console.log("Connected to database");
  }

});

var db = mongoose.connection;

app.set('views', path.join(root,"views"));

//set the template engine
app.set('view engine', 'ejs');

//static files
app.use(express.static(path.join(root,'/statics')));
admin.use(express.static(path.join(root,'/statics')));

//middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use(cookieParser());
app.use(session({
    secret: 'a4f8071f-c873-4447-8ee2',
    resave : false,
    saveUninitialized : true
    }));

//passport init
app.use(passport.initialize());
app.use(passport.session());

//express validator
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

//connect flash
app.use(flash());

//create global values
app.use(function(req, res, next){
	res.locals.success_msg = req.flash('success_msg') || null;
	res.locals.error_msg = req.flash('error_msg');
	res.locals.error = req.flash('error');	//for passport error messages
  next();
});

admin.use(function(req, res, next){
  res.locals.user = req.user || null;
  next();
});


//url entries
app.use('/', routes);
admin.use('/', writers);

//load admin on parent app
app.use('/admin', admin);

//start server
const port = 3000; 

app.listen(port, function(){
  console.log('Server running on port '+port);
});
