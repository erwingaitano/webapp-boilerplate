'use strict';

const express = require('express');
const router = express.Router();
const templateManager = require.main.require('./utils/template-manager');

router.get('/about', function(req, res, next){
  res.write(templateManager.compile(require.resolve('../views/about.jade'), {title: 'about'}));
  res.end();
});

module.exports = router;