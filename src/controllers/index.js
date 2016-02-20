'use strict';

const express = require('express');
const router = express.Router();
const templateManager = require.main.require('./utils/template-manager');

// Routes

router.get('/', function(req, res, next){
  res.write(templateManager.compile(require.resolve('../views/index.jade'), {title: 'index'}));
  res.end();
});

router.use(require('./about.js'));

// catch 404 and forward to error handler
router.use(function(req, res, next) {
  res.status(404);
  res.write(templateManager.compile(require.resolve('../views/error404.jade'), {url: req.originalUrl}));
  res.end();
});

// Error handler
router.use(function(err, req, res, next) {
  res.status(500).send('Something broke!');
});

module.exports = router;