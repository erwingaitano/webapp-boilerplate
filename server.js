'use strict';

require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();
const isDevelopment = process.env.NODE_ENV === 'development';
const port = process.env.PORT || 3000;
app.locals.isDevelopment = isDevelopment;

function webpackServer(app){
  const webpack = require('webpack');
  const webpackConfig = require('./webpack.config.js');
  const webpackDevMiddleware = require("webpack-dev-middleware");
  const webpackHotMiddleware = require("webpack-hot-middleware");
  const webpackCompiler = webpack(webpackConfig);

  app.use(webpackDevMiddleware(webpackCompiler, {
    hot: true,
    filename: webpackConfig.output.filename,
    publicPath: webpackConfig.output.publicPath,
    stats: { colors: true }
  }));
   
  app.use(webpackHotMiddleware(webpackCompiler, { path: '/__webpack_hmr'}));
}

function viewsEngine(app){
  const jade = require('jade');
  const srcPathView = path.resolve(__dirname, 'app', 'views');
  const buildPathView = path.resolve(__dirname, 'dist', 'views');
  app.locals.basedir = path.resolve(__dirname, 'app', 'views');
  app.set('view engine', 'jade');
  app.set('views', isDevelopment ? srcPathView : buildPathView);
}

// We point to our static assets
app.use(express.static(path.resolve(__dirname, 'dist')));

// Load Controllers
app.use(require(path.resolve(__dirname, 'app', 'controllers')));

// Set the view engine
viewsEngine(app);

// Run webpack only in dev mode
if (isDevelopment) webpackServer(app);

// Run the server
app.listen(port, function(){console.log('Server running on port ' + port);});
