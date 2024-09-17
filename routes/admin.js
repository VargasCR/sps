var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('admin/login', { 
        title: 'Admin Login' 
    });
});
router.get('/singup', function(req, res, next) {
  res.render('admin/singup', { 
        title: 'Admin Login' 
    });
});

module.exports = router;