var express = require('express');
var passport = require('passport');
var multer = require('multer');
var localStrategy = require('passport-local').Strategy;
var join = require('path').join;

var router = express.Router();
var errors = null;
//var articles = join(__dirname,'uploads/posts');
var upload = multer({dest: 'uploads/posts'});

//define required variables
var User = require('../models/writers.js');
var Post = require('../models/posts.js');

router.get('/register', function(req, res){
	console.log(req.url);
	res.render('signup', { 
		errors : errors
	 });
});

router.get('/', function(req, res){
	console.log(req.url);
	res.render("login");
});

router.get('/updateblog', ensureAuthenticated, function(req,res){
	console.log(req.url);
	res.render("updateblog", {errors:errors});
});

router.get('/logout', function(req, res){
	req.logout();
	req.flash('success_msg', 'You have logout');
	res.redirect('/admin');
});

router.post('/register', function(req, res){

		var f_name = req.body.f_name;
		var s_name = req.body.s_name;
		var about = req.body.about;
		var email = req.body.email;
		var pasword = req.body.pasword;
		var pasword1 = req.body.pasword1;
		
		//check for data entered
		req.checkBody('f_name', 'First name is required').notEmpty();
		req.checkBody('s_name', 'Second name is required').notEmpty();
		req.checkBody('about', 'About field is required').notEmpty();
		req.checkBody('email', 'Enter your email').notEmpty();
		req.checkBody('pasword', 'Password cannot be empty').notEmpty();
		req.checkBody('pasword1', 'Passwords do not match').equals(pasword);

		var errors = req.validationErrors();

		if(!!errors){
			res.render('signup',{ errors : errors});
		}else{
			var newUser = new User({
				f_name : f_name,
				s_name : s_name,
				about : about,
				email : email,
				password : pasword
			});

			User.createUser(newUser, function(err, user){
				if(err) throw err;
				console.log(user);
			});
			req.flash('success_msg', "You can now Login");

			res.redirect('/admin');
		}
});

passport.use(new localStrategy({
	usernameField : 'login_email',
	passwordField : 'login_pass'
},function(username, password, done){
	User.getUserByUsername(username, function(err, user){
		if(err)  throw err;
		if(!user){
			return done(null, false, {message:'Unknown user'});
		}

		User.comparePassword(password, user.password, function(err, matches){
			if(err) throw err;
			if(matches){
				return done(null, user);
			}else{
				return done(null, false, {message: "Invalid Password"});
			}
		});
	});
}));

//serialize user for a session when they login
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});

router.post('/',
  passport.authenticate('local',{
  	successRedirect:"/admin/updateblog",
  	failureRedirect:"/admin",
  	failureFlash : true
  }));

router.post('/updateblog', upload.any(), function(req, res, next){
	//assign 
	var blog_title = req.body.title;
	var name = req.files[0].path;


	console.log(blog_title);

		var newPost = new Post({
			blog_title : blog_title,
			date : new Date(),
			path : name,
			writer_id : req.user.id
		});

		Post.createPost(newPost, function(err){
			if(err) throw err;
		});
		console.log('Item saved');
		req.flash('success_msg', 'Post was successfully uploaded');
		res.redirect('/admin/updateblog');
});

function ensureAuthenticated(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}else{
		req.flash('error_msg', 'You are not logged in');
		res.redirect('/admin');
	}
}

module.exports = router;