var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  //res.render('index', { title: 'EyeOnExpenses' });
  if(req.session.user == undefined)
    res.sendFile(__dirname+'/login.html');
  else
    res.redirect('/'+req.session.user);
});

router.get('/:username', function(req, res, next) {
  //res.render('home', { title: 'EyeOnExpenses' });
  if(req.session.user == undefined)
    res.redirect('/');
  else
    res.sendFile(__dirname+'/home.html');
});

module.exports = router;
