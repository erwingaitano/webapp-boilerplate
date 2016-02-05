'use strict';

const webpack = require('webpack');
const path = require('path');
const htmlWebpackPlugin = require('html-webpack-plugin');
const nodeModulesPath = path.resolve(__dirname, 'node_modules');
const buildPath = path.resolve(__dirname, 'dist', 'assets');
const assetPath = path.resolve(__dirname, 'app', 'assets');
const hmrRoute = 'webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000&reload=true';
const isDevelopment = process.env.NODE_ENV === 'development';

const cssLoader = { test: /\.scss$/, exclude: [nodeModulesPath], loader: 'style!css!sass' };
const plugins = [
  new webpack.HotModuleReplacementPlugin(),
  new webpack.NoErrorsPlugin,
  new webpack.optimize.CommonsChunkPlugin(
    'common', 
    'common' + (!isDevelopment? '.[hash]' : '.bundle') + '.js', 
    ['index', 'about']
  )
];
const entry = {
  'index': [hmrRoute, path.resolve(assetPath, 'js', 'index.js')],
  'about': [hmrRoute, path.resolve(assetPath, 'js', 'about.js')],
  '404': [path.resolve(assetPath, 'js', '404.js')]
};
const output = { 
  path: buildPath,
  publicPath: '/assets/',
  filename: '[name].bundle.js'
};

/*
  If it's production then generate the css files and
  remove the HMR scripts off the entries
 */

if(!isDevelopment){
  const extractTextPlugin = require("extract-text-webpack-plugin");
  
  // Remove the hmr scripts
  entry.index.splice(0, 1);
  entry.about.splice(0, 1);

  // Add chunkhash to filenames for long-term cache
  output.filename = '[name].[chunkhash].js';

  // Extract the css styles instead of inlining them
  cssLoader.loader = extractTextPlugin.extract('style', 'css!sass'); 
  plugins.push(new extractTextPlugin('[name].[chunkhash].css'));

  // Generate the views for Express after adding the css/js dynamically
  plugins.push(
    new htmlWebpackPlugin({
      template: 'app/views/index.jade',
      filename: '../views/index.jade',
      inject: false,
      chunks: ['common', 'index']
    }),
    new htmlWebpackPlugin({
      template: 'app/views/about.jade',
      filename: '../views/about.jade',
      inject: false,
      chunks: ['common', 'about']
    })
  );
}

module.exports = {
  devtool: 'eval-source-map',
  entry: entry,
  output: output,
  resolve: { root: assetPath },
  module: {
    preLoaders: [
      { test: /\.js$/, exclude: [nodeModulesPath], loader: 'jshint-loader' }
    ],
    loaders: [
      cssLoader,
      { test: /\.jsx?$/, loader: 'babel', exclude: [nodeModulesPath],
        query: { presets: ['react', 'es2015'] }
      }
    ]
  },
  plugins: plugins
};