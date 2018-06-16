var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/cryptocurrency', function(req, res, next) {
  res.render('cryptocurrency');
});

router.get('/blockchain', function(req, res, next) {
  res.render('blockchain');
});

module.exports = router;
