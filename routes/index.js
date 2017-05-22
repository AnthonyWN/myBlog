var express = require('express');
var mammoth = require('mammoth');
var join = require('path').join;



var router = express.Router();
var Post = require('../models/posts.js');
var User = require('../models/writers.js');


router.get('/', function(req, res){
	Post.getData(function(err, data){
		if(err) throw err;
		res.render('index',{data: data});
	});
});

router.post('/:post_data', function(req, res){
	console.log(req.body);
	var post = req.body.post_data;

	Post.getArticleData(post, function(err, data){
		if(err) throw err;
		if(!data) {
			{text:'<p>No Data found</p>'}
			console.log("No data found");
		}else{
			var path = data.path;
			var title = data.blog_title;
			var date = data.date;
			var writer = User.user(data.writer_id);

			console.log("getting "+data.path);

			mammoth.convertToHtml({path: join(__dirname, "../"+path)})
			    .then(function(result){
			        var text = result.value; // The raw text
			        var messages = result.messages; //any extra messages like warnings
							if(!!text){
								console.log("got the docx file");
								text = result.value
							}else{
								console.log("post not found");
								text = "<p>post not recovered</p>";
							}
							res.json({
							 writer : writer,
							 text : text,
							 date : date,
							 title : title
						 });
			   })
			    .done();


		}
	});

});

router.get('/writers', function(req, res){
	User.all(function(err, data){
		if(err) throw err;
		res.render('writers', {writers : data});
	});
});

router.get('/about', function(req, res){
	res.render('about');
});

module.exports = router
