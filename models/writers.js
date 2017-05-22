var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

//data model
var userSchema = mongoose.Schema({
	f_name:{
		type:String,
		index:true
	},
	s_name:{
		type:String
	},
	email:{
		type:String
	},
	about:{
		type:String
	},
	password:{
		type:String
	}
});

//parse data to database
var User = module.exports = mongoose.model('User', userSchema);

module.exports.createUser = function(newUser, callback){
	bcrypt.genSalt(10, function(err, salt) {
	    bcrypt.hash(newUser.password, salt, function(err, hash) {
	        newUser.password = hash;
	        newUser.save(callback);
	    });
	});
}

//fetch data for authentication
module.exports.getUserByUsername = (function(username, callback){
	User.findOne({email: username}, callback);
});
module.exports.getUserById = function(id, callback){
	User.findById(id, callback);
}
module.exports.comparePassword = function(login_pass, hash, callback){
	bcrypt.compare(login_pass, hash, function(err, matches) {
    	 if (err) throw err;
    	 callback(null, matches);
	});
}

//To get name of writer for article
module.exports.user = function(id, callback){
	User.findOne({ _id:id }, function(err, user){
		if (err) throw err;
		var name = user.f_name+" "+ user.s_name;
		return (name);
	});
}

module.exports.all = function(callback){
	User.find({}, callback);
}
