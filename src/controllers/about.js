'use strict';

const express = require('express');
const router = express.Router();

// Routes

router.get('/about', function(req, res){
  res.render('about', {title: 'About'});
});

module.exports = router;