'use strict';

require('dotenv').config({silent: true});
const express = require('express');
const paths = require.main.require('./config.paths');
const app = express();
const isDevelopment = process.env.NODE_ENV === 'development';
const port = process.env.PORT || 3000;

function webpackServer(app){
  const webpack = require('webpack');
  const webpackConfig = require(paths.webpackConfig);
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

// Static assets
app.use(express.static(isDevelopment ? paths.assetPath : paths.distPath));

if (isDevelopment) {
  // Run webpack
  webpackServer(app);
}

// Load Controllers (routes) at the end.
// So that webpack middlewares can load manage his routes first
app.use(require(paths.controllersPath));

// Run the server
app.listen(port, function(){
  console.log('Server running on port ' + port);
});
