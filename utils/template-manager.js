'use strict';

const paths = require.main.require('./config.paths');
const jade = require('jade');
const isDevelopment = process.env.NODE_ENV === 'development';
var config = {basedir: paths.baseDir, cache: true};

// Webpack Asset Helpers so we expose them to the templates
const expressWebpackAsset = require.main.require('./utils/express-webpack-assets')(paths.expressWebpackAssetPath, {
  devMode: isDevelopment
});
const assetHelpers = {
  webpack_asset_css: expressWebpackAsset.webpack_asset_css,
  webpack_asset_js: expressWebpackAsset.webpack_asset_js,
  webpack_asset_url: expressWebpackAsset.webpack_asset_url
};

module.exports.compile = function(path, options){
  try{
    var templateFn;
    if(isDevelopment){
      Object.assign(config, {cache: false});
    }
    templateFn = jade.compileFile(path, config);
    return templateFn(Object.assign({isDevelopment: isDevelopment}, options, assetHelpers));

  } catch(e) {
    console.log('could not compile template', e);
  }
}