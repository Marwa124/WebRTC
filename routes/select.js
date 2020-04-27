var express = require('express');
var router = express.Router();
var url = require('url');

/* GET users listing. */
router.get('/', function(req, res, next) {
    
    var queryData = url.parse(req.url, true).query;
    var mysql      = require('mysql');
    var connection = mysql.createConnection({
        host     : 'localhost',
        user     : 'root',
        password : '',
        database : 'live-chat-node'
    });
    
    connection.connect();
    var id = 0;
    if(queryData.id == null){
        id = -1;
    }else{
        id = queryData.id;
    }
        
    connection.query('SELECT * from users', 
        function (error, results, fields) {
            if(!error){
                res.render('select', {data: results});
            }else{
                res.render('select', {data: error});
            }
        });
    connection.end();
});

module.exports = router;
