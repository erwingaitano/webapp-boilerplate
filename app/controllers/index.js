'use strict';

const express = require('express');
const router = express.Router();

// Routes

router.get('/', function(req, res){
  res.render('index', {title: 'Index'});
});

router.use(require('./about.js'));

module.exports = router;