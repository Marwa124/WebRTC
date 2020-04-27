var express = require('express');
var router = express.Router();

const multer = require('multer');
const fs = require('fs'); //file system
const path = require('path');
const bcrypt = require('bcrypt-nodejs');

var storage = multer.diskStorage({
  destination: './public/images/',
  //  function(req, file, callback){
  //   var dir = "./uploads";
  //   if(!fs.existsSync(dir))
  //   {
  //     fs.mkdirSync(dir);
  //   }
  //   callback(null, dir);
  // },
  filename: function(req, file, callback){
    callback(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
  }
});

// image is the name of the attributes initialized in input type=file
// 1 is the no.of files that can be uploaded at a time
var upload = multer({
  storage: storage,
  // limits: {fileSize: 10}
}).single('image');

var mysql      = require('mysql');
var db = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '',
    database : 'live-chat-node'
});

router.get('/testconnect', function(req, res, next) {
  if(db != null){
    res.send('connect success');
  }else{
    res.send('connect fails');
  }
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/', function(req, res, next) {
  
    db.query('select * from users where email = ?', req.body.email, function(error, results) {
      if(!error){
        // console.log(results[0]);
        let hash = results[0].password;
        let password = bcrypt.compareSync(req.body.password, hash);
        if(password){
          res.render('users', {data: results[0]});
        }else{
          res.send("Bad req!");
        }
      }else{
        res.send("Incorrect email address!");
        console.log(error);
      }
    });
});

router.get('/profile', function(req, res, next) {
  db.query('select * from users where id = ?', req.query.id, function(error, result) {
    console.log(result);
    res.render('profile', {data: '', val: result[0]});
  });
});

router.post('/profile', function(req, res, next) {
  var param = req.query.id;
  upload(req, res, function(error){
    console.log(req);
    
    if(error != null)
      {
        res.render('profile', {msg: error.sqlMessage});
      }else{
        db.query('update users set image ="'+ req.file.filename +'" where id ='+ param , function(error, result) {
          if(error){
            res.redirect("/profile", {
              msg: error
            })
          }else{
            res.redirect("/select");
          }
        });
      }
  });
});

router.get('/form', function(req, res, next) {
  res.render('form', {data: '', val: ''});
});

router.post('/form', function(req, res, next) {
  console.log(req.body);

  var password = bcrypt.hashSync(req.body.password);
  db.query('insert into users (name, email, password, image) values ("' + req.body.name + '", "' + req.body.email + '", "' + password + '", "' + req.body.image + '")', req.body, function(error, result) {
    
    if(error != null)
    {
      res.render('form', {data: error.sqlMessage, val: ''});
    }else{
      res.redirect("/select");
    }
  });
});

router.get('/delete', function(req, res, next) {
  db.query('delete from users where id = ?', req.query.id, function(error, result){
    res.redirect('/select');
  });
});

router.get('/edit', function(req, res,next){
  db.query('select * from users where id = ?', req.query.id, function(error, result) {
    console.log(result);
    
    res.render('form', {data: '', val: result[0] });
  });
});

router.post('/edit', function(req, res, next) {
  var param = [
    req.body,    // data for update 
    req.query.id // condition for update
  ];

  db.query('update users set ? where id = ?', param, function(error, result) {
    res.redirect('/select');
  });
});

module.exports = router;
