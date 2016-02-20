const path = require('path');

const srcFolder = 'src';
const baseDir = path.resolve(__dirname, srcFolder);
module.exports = {
  baseDir: baseDir,
  webpackConfig: path.resolve(__dirname, 'webpack.config.js'),
  viewsPath: path.resolve(baseDir, 'views'),
  controllersPath: path.resolve(baseDir, 'controllers'),
  assetPath: path.resolve(baseDir, 'assets'),
  distPath: path.resolve(__dirname, 'dist'),
  allAssetsPath: path.resolve(__dirname, 'config.assets.js'), // All Assets (jpg|png|svg|gif)
  publicPath: '/', // Public path for webpack (you can use a CDN for example)
  contextForAllAssetsPath: path.resolve(__dirname, srcFolder + '/assets'),
  expressWebpackAssetPath: path.resolve(__dirname, 'webpack-assets.json'),
  assetsJsonPath: '../webpack-assets.json' // TODO:: Must be Relative to distPath
};