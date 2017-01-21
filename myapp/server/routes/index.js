var express = require('express');
var router = express.Router();
var path = require('path')

/* GET home page. */
router.get('*', (req, res) => {
  console.log('hello')
  res.sendFile(path.join(__dirname, '../../dist', 'index.html'))
})

module.exports = router;
