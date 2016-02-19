'use strict';

require('dotenv').config({silent: true});
const express = require('express');
const path = require('path');
const app = express();
const expressWebpackAsset = require('./app/middlewares/express-webpack-assets');
const isDevelopment = process.env.NODE_ENV === 'development';
const port = process.env.PORT || 3000;
app.locals.isDevelopment = isDevelopment;
app.locals.basedir = path.resolve(__dirname, 'app');

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
  app.set('view engine', 'jade');
  app.set('views', srcPathView);
}

// Static assets
app.use(express.static(path.resolve(__dirname, isDevelopment ? 'app/assets' : 'dist')));

// Allow express to use the webpack assets
app.use(expressWebpackAsset('./dist/webpack-assets.json', {
  devMode: isDevelopment
}));

// Set the view engine
viewsEngine(app);

if (isDevelopment) {
  app.locals.pretty = true;

  // Run webpack
  webpackServer(app);
}

// Load Controllers (routes) at the end.
// So that webpack middlewares can load manage his routes first
app.use(require(path.resolve(__dirname, 'app', 'controllers')));

// Run the server
app.listen(port, function(){console.log('Server running on port ' + port);});
