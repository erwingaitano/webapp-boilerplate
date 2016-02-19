'use strict';

const webpack = require('webpack');
const path = require('path');
const autoprefixer = require('autoprefixer');
const statsWriterPlugin = require("webpack-stats-plugin").StatsWriterPlugin;
const distPath = path.resolve(__dirname, 'dist', 'assets');
const assetPath = path.resolve(__dirname, 'app', 'assets');
const buildPath = path.resolve(__dirname, 'build');
const hmrRoute = 'webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000&reload=true';
const isDevelopment = process.env.NODE_ENV === 'development';
const assetExtensions = /\.(jpg|png|gif|svg)$/i;

const cssLoader = { test: /\.scss$/, include: [assetPath], loader: 'style!css!postcss-loader!sass' };
const imgLoader = {test: assetExtensions, loaders: []};

const entry = {
  index: [hmrRoute, path.resolve(assetPath, 'js', 'index.js')],
  about: [hmrRoute, path.resolve(assetPath, 'js', 'about.js')],
  error404: [hmrRoute, path.resolve(assetPath, 'js', 'error404.js')]
};
const output = { 
  path: distPath,
  publicPath: '/assets/',
  filename: '[name].bundle.js'
};
const plugins = [
  new webpack.HotModuleReplacementPlugin(),
  new webpack.NoErrorsPlugin,
  new webpack.optimize.CommonsChunkPlugin({
    name: 'common',
    filename: 'common' + (!isDevelopment? '.[hash]' : '.bundle') + '.js',
    children: true,
    chunks: ['index', 'about', 'error404']
  })
];

/*
  If it's production then generate the css files and
  remove the HMR scripts off the entries
 */

if(!isDevelopment){
  const extractTextPlugin = require("extract-text-webpack-plugin");
  
  // Remove the hmr scripts
  entry.index.splice(0, 1);
  entry.about.splice(0, 1);
  entry.error404.splice(0, 1);
  entry.assets = path.resolve(__dirname, 'config/assets.js');
  plugins.shift();

  // Add chunkhash to filenames for long-term cache
  // output.filename = '[name].[chunkhash].js';
  output.filename = '[name].[hash].js';

  // Extract the css styles from the bundles instead of inlining them
  cssLoader.loader = extractTextPlugin.extract('style-loader', 'css?root=' + assetPath + '!postcss-loader!sass'); 
  plugins.push(new extractTextPlugin('[name].[contenthash].css'));

  // Add image compresion
  imgLoader.loaders = [
    'file?hash=sha512&digest=hex&name=[name].[hash].[ext]',
    'image-webpack?progressive=true&bypassOnDebug&optimizationLevel=7&interlaced=false'
  ];

  // TODO:: OccurrenceOrderPlugin ????
  // Generate the assets json for express to consume
  plugins.push(
    new webpack.optimize.OccurenceOrderPlugin(),
    new statsWriterPlugin({
      filename: '../../build/webpack-assets.json',
      fields: ['assetsByChunkName', 'modules'],
      transform: function(data){
        // Assets
        data.assets = {};
        data.modules.forEach(function(el){
          if(el.name.match(assetExtensions)) 
            data.assets[el.reasons[0].userRequest.substring(1)] = output.publicPath + el.assets[0];
        });

        // Entries
        data.entries = {};
        Object.keys(data.assetsByChunkName).forEach(function(k){
          var item = {};
          if(Array.isArray(data.assetsByChunkName[k])){
            data.assetsByChunkName[k].forEach(function(el){
              item[el.match(/(css|js)*$/)[0]] = output.publicPath + el;
            });
          }else{
            item[data.assetsByChunkName[k].match(/(css|js)*$/)[0]] = output.publicPath + data.assetsByChunkName[k];
          }
          data.entries[k] = item;
        });

        delete data.entries.assets;
        delete data.modules;
        delete data.assetsByChunkName;
        return JSON.stringify(data, null, 2);
      }
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
      { test: /\.js$/, include: [assetPath], loader: 'jshint-loader' }
    ],
    loaders: [
      cssLoader,
      imgLoader,
      { test: /\.jsx?$/, loader: 'babel', include: [assetPath],
        query: { presets: ['react', 'es2015'] }
      }
    ]
  },
  postcss: [ autoprefixer({ browsers: ['last 2 versions'] }) ],
  plugins: plugins
};