var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'EyeOnExpenses' });
});

router.get('/1', function(req, res, next) {
  //res.render('home', { title: 'EyeOnExpenses' });
  res.sendFile(__dirname+'/home.html');
});

module.exports = router;
