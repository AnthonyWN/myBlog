var mongoose = require('mongoose');

var postsSchema = mongoose.Schema({
	blog_title:{
		type: String
	},
	date:{
		type: Date
	},
	path:{
		type: String
	},
	writer_id:{
		type: String
	}
});

var Post = module.exports = mongoose.model('Posts', postsSchema);

//add new post to collection posts
module.exports.createPost = function(newPost, callback){
	newPost.save();
}

//fetch posts for index page
module.exports.getData = function(callback){
	Post.find({}, callback).sort({'date':-1});
}

module.exports.getArticleData = function(post, callback){
	Post.findOne({ _id : post}, callback);
}
