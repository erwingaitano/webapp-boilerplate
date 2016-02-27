const path = require('path');

const srcFolder = 'src';
const webpackFolder = 'webpack';
const baseDir = path.resolve(__dirname, srcFolder);
module.exports = {
  baseDir,
  webpackConfig: path.resolve(__dirname, `${webpackFolder}/config.babel.js`),
  viewsPath: path.resolve(baseDir, 'views'),
  controllersPath: path.resolve(baseDir, 'controllers'),
  assetPath: path.resolve(baseDir, 'assets'),
  distPath: path.resolve(__dirname, 'dist'),

  // All Assets (jpg|png|svg|gif)
  allAssetsPath: path.resolve(__dirname, `${webpackFolder}/asset.js`),
  assetHelper: path.resolve(__dirname, `${webpackFolder}/asset-helper.js`),
  publicPath: '/', // Public path for webpack (you can use a CDN for example)
  contextForAllAssetsPath: path.resolve(__dirname, `${srcFolder}/assets`),
  expressWebpackAssetPath: path.resolve(__dirname, `${webpackFolder}/assets.json`),
  assetsJsonPath: `../${webpackFolder}/assets.json`, // FIXME: Must be Relative to distPath
};

