'use strict';

const webpack = require('webpack');
const path = require('path');
const paths = require('./config.paths');
const vars = require('./config.vars');
const autoprefixer = require('autoprefixer');
const statsWriterPlugin = require('webpack-stats-plugin').StatsWriterPlugin;
const hmrRoute = 'webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000&reload=true';
const isDevelopment = process.env.NODE_ENV === 'development';

const cssLoader = {test: /\.s?css$/, include: [paths.assetPath], loader: 'style!css!postcss-loader!sass' };
const imgLoader = {test: vars.assetExtensions, loaders: []};
const iconFontLoader = {test: /fonts\/icons\/.*\/font\.(js|json)$/, loader: 'style!css!fontgen?types=woff'};


const entry = {
  index: [hmrRoute, path.resolve(paths.assetPath, 'js/index.js')],
  about: [hmrRoute, path.resolve(paths.assetPath, 'js/about.js')],
  error404: [hmrRoute, path.resolve(paths.assetPath, 'js/error404.js')]
};
const output = { 
  path: isDevelopment ? paths.assetPath : paths.distPath,
  publicPath: paths.publicPath,
  filename: '[name].bundle.js'
};
const plugins = [
  new webpack.HotModuleReplacementPlugin(),
  new webpack.NoErrorsPlugin,
  new webpack.optimize.CommonsChunkPlugin({
    name: 'common',
    filename: 'common' + (!isDevelopment? '.[hash]' : '.bundle') + '.js',
    chunks: ['index', 'about']
  }),
  new webpack.DefinePlugin({
    __ASSETS_EXTENSIONS__: vars.assetExtensions,
    __CONTEXT_ASSETS_PATH__: JSON.stringify(paths.contextForAllAssetsPath)
  })
];

/*
  If it's production then generate the css files and
  remove the HMR scripts off the entries
 */

if(!isDevelopment){
  const extractTextPlugin = require('extract-text-webpack-plugin');
  
  // Remove the hmr scripts
  Object.keys(entry).forEach(function(key){ entry[key].splice(0, 1);});
  plugins.shift();

  // Automated entry for all the assets (jpgs, svgs(not icons), png, gif)
  entry.assets = paths.allAssetsPath;

  // Add chunkhash to filenames for long-term cache
  output.filename = '[name].[chunkhash].js';
  // output.filename = '[name].[hash].js';

  // Extract the css styles from the bundles instead of inlining them
  // The root option in css-loader is to resolve the urls inside css files
  cssLoader.loader = extractTextPlugin.extract('style-loader', 'css?root=' + paths.assetPath + '!postcss-loader!sass'); 
  // TODO:: The fontgen-loader plugin generates the file with a different 
  // hash everytime. also it generates multiple woff files
  iconFontLoader.loader = extractTextPlugin.extract('style-loader', 'css!fontgen?types=woff,eot,ttf');
  plugins.push(new extractTextPlugin('[name].[contenthash].css'));

  // Add image compresion
  imgLoader.loaders = [
    'file?hash=sha512&digest=hex&name=[name].[hash].[ext]',
    'image-webpack?progressive=true&bypassOnDebug&optimizationLevel=7&interlaced=false'
  ];

  // TODO:: OccurrenceOrderPlugin ????
  // statsWriterPlugin generates the assets json for the template-manager to consume
  plugins.push(
    new webpack.optimize.OccurenceOrderPlugin(),
    new statsWriterPlugin({
      filename: paths.assetsJsonPath,
      fields: ['assetsByChunkName', 'modules'],
      transform: function(data){
        // Assets
        data.assets = {};
        data.modules.forEach(function(el){
          if(el.name.match(vars.assetExtensions)) 
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
  resolve: { root: paths.assetPath },
  module: {
    preLoaders: [
      { test: /\.js$/, include: [paths.assetPath], loader: 'jshint-loader' }
    ],
    loaders: [
      cssLoader,
      imgLoader,
      iconFontLoader,
      // JS Babel
      { test: /\.jsx?$/, loader: 'babel', include: [paths.assetPath],
        query: { presets: ['react', 'es2015'] }
      },
    ]
  },
  postcss: [autoprefixer({ browsers: ['last 2 versions'] })],
  plugins: plugins
};