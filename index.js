var express = require('express');

var app = new express();
//ejs
app.set('view engine' , 'ejs');
app.set('views','./views');
app.use(express.static('public'));

//post lang nghe
app.listen(3000);

//body-parse
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended:false}));

//muler upload file
var multer = require('multer');
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/upload') //vi tri de luu file
    },
    filename: function (req, file, cb) {
      cb(null, Date.now()  + "-" + file.originalname)
    }
});  
var upload = multer({ 
    storage: storage,
    fileFilter: function (req, file, cb) {
        console.log(file);
        if(file.mimetype=="image/bmp" ||
         file.mimetype=="image/png" ||
         file.mimetype=="image/jpg" ||
         file.mimetype=="image/jpeg" ||
         file.mimetype=="image/gif" 
         ){
            cb(null, true)
        }else{
            return cb(new Error('Only image are allowed!'))
        }
    }
}).single("imageBook"); // name trong the input type=”file”



//mongoose config
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/test', {useNewUrlParser: true , useUnifiedTopology: true , useFindAndModify: false} ,function(err) {
    if(err) {
        console.log('connect false');
    }else {
        console.log('connect successfully');
    }
});

//cau hinh ket noi voi angular
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});


var Category = require("./Model/category");

var Book = require('./Model/book');



//----API TO ANGULAR----//
app.get('/api/cate',function(req,res){
    Category.find(function(err,data) {
        if(err) {
            console.log('fail');
        }else {
            res.json(data);
        }
    })
})

app.get('/api/book',function(req,res) {
    Book.find(function(err,data) {
        if(err) {
            console.log('fail');
        }else {
            res.json(data);
        }
    })
})


app.get('/',function(req,res) {
    res.render('home');
})

app.get('/cate',function(req,res) {
    res.render('cate');
});

app.post('/cate',function(req,res) {
    var newCate = new Category({
        name:req.body.txtName,
        books_id:[]
    })
    newCate.save(function(err) {
        if(err) {
            res.json({kq: 0 });
        } else {
            res.json({kq: 1});
        }
        
    })
});

app.get('/book',function(req,res) {
    //get list categoey
    Category.find(function(err , item) {
        if(err) {
            res.send('Err');
        }else {
            console.log(item);
            res.render('book',{Cates: item});
        }
    });

}) ;

app.post('/book',function(req,res) {
//upload file
upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      console.log("A Multer error occurred when uploading."); 
      res.json({kq:0,'err' : err});
    } else if (err) {
      console.log("An unknown error occurred when uploading." + err);
      res.json({kq:0,'err' : err});

    }else{
        console.log("Upload is okay");
        console.log(req.file); // Thông tin file đã upload
        // res.json(req.file)
    }

    var book = new Book({
        name: req.body.txtName,
        image: req.file.filename,
        file: req.body.txtFile
    });
    book.save(function(err) {
        if(err) {
            res.json({kq : 0});
        }else {
            // res.json({kq: 1});
          //-----update books_id in category ...//
          Category.findOneAndUpdate({_id: req.body.selectCate},
            {$push:{books_id: book._id}},
            function(err) {
                if(err) {
                    console.log('fail');
                    res.json({kq: 0});
                }else {
                    console.log("update books_id ok");
                    res.json({kq: 1});
                }
            }
            )};
    });

});


})




