'use strict';

const express = require('express');
const router = express.Router();

// Routes

router.get('/', function(req, res){
  res.render('index', {title: 'Index'});
});

router.use(require('./about.js'));

// catch 404 and forward to error handler
router.use(function(req, res, next) {
  res.status(404).render('error404', { url: req.originalUrl });
});

// Error handler
router.use(function(err, req, res, next) {
  res.status(500).send('Something broke!');
});

module.exports = router;