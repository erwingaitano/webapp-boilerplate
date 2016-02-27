const webpack = require('webpack');
const path = require('path');
const paths = require('../config.paths');
const vars = require('../config.vars');
const autoprefixer = require('autoprefixer');
const StatsWriterPlugin = require('webpack-stats-plugin').StatsWriterPlugin;
const hmrRoute = 'webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000&reload=true';
const isDevelopment = process.env.NODE_ENV === 'development';
const cssLoader = {
  test: /\.s?css$/,
  include: [paths.assetPath],
  loader: 'style!css!postcss-loader!sass',
};
const imgLoader = {
  test: vars.assetExtensions,
  loaders: [],
};
const iconFontLoader = {
  test: /fonts\/icons\/.*\/font\.(js|json)$/,
  loader: 'style!css!fontgen?types=woff',
};
const jsBabelLoader = {
  test: /\.js$/,
  loaders: ['babel?presets[]=react,presets[]=es2015', 'eslint-loader'],
  include: [paths.assetPath],
};

const entry = {
  index: [hmrRoute, path.resolve(paths.assetPath, 'js/index.js')],
  about: [hmrRoute, path.resolve(paths.assetPath, 'js/about.js')],
  error404: [hmrRoute, path.resolve(paths.assetPath, 'js/error404.js')],
};
const output = {
  path: isDevelopment ? paths.assetPath : paths.distPath,
  publicPath: paths.publicPath,
  filename: '[name].bundle.js',
};
const plugins = [
  new webpack.HotModuleReplacementPlugin(),
  new webpack.NoErrorsPlugin(),
  new webpack.optimize.CommonsChunkPlugin({
    name: 'common',
    filename: `common${!isDevelopment ? '.[hash]' : '.bundle'}.js`,
    chunks: ['index', 'about'],
  }),
  new webpack.DefinePlugin({
    __ASSETS_EXTENSIONS__: vars.assetExtensions,
    __CONTEXT_ASSETS_PATH__: JSON.stringify(paths.contextForAllAssetsPath),
  }),
];

/*
  If it's production then generate the css files and
  remove the HMR scripts off the entries
 */

if (!isDevelopment) {
  const ExtractTextPlugin = require('extract-text-webpack-plugin');
  const CompressionPlugin = require('compression-webpack-plugin');

  // Remove the hmr scripts
  Object.keys(entry).forEach(key => {
    entry[key].splice(0, 1);
  });
  plugins.shift();

  // Automated entry for all the assets (jpgs, svgs(not icons), png, gif)
  entry.assets = paths.allAssetsPath;

  // Add chunkhash to filenames for long-term cache
  output.filename = '[name].[chunkhash].js';
  // output.filename = '[name].[hash].js';

  // Extract the css styles from the bundles instead of inlining them
  // The root option in css-loader is to resolve the urls inside css files
  cssLoader.loader = ExtractTextPlugin.extract('style-loader',
    `css?minimize&root=${paths.assetPath}!postcss-loader!sass`);

  // TODO:: The fontgen-loader plugin generates the file with a different
  // hash everytime. also it generates multiple woff files
  iconFontLoader.loader = ExtractTextPlugin.extract('style-loader',
    'css?minimize!fontgen?types=woff,eot,ttf');
  plugins.push(new ExtractTextPlugin('[name].[contenthash].css'));

  // Add image compresion
  imgLoader.loaders = [
    'file?hash=sha512&digest=hex&name=[name].[hash].[ext]',
    'image-webpack?progressive=true&bypassOnDebug&optimizationLevel=7&interlaced=false',
  ];

  // TODO: OccurrenceOrderPlugin ????
  // StatsWriterPlugin generates the assets json for the template-manager to consume
  plugins.push(
    new webpack.optimize.OccurenceOrderPlugin(),
    new StatsWriterPlugin({
      filename: paths.assetsJsonPath,
      fields: ['assetsByChunkName', 'modules'],
      transform(data) {
        const newData = data;
        // Assets
        newData.assets = {};
        newData.modules.forEach(el => {
          if (el.name.match(vars.assetExtensions)) {
            newData.assets[el.reasons[0].userRequest.substring(1)] = output.publicPath + el
              .assets[
                0];
          }
        });

        // Entries
        newData.entries = {};
        Object.keys(newData.assetsByChunkName).forEach(k => {
          const item = {};
          if (Array.isArray(newData.assetsByChunkName[k])) {
            newData.assetsByChunkName[k].forEach(el => {
              item[el.match(/(css|js)*$/)[0]] = output.publicPath + el;
            });
          } else {
            item[newData.assetsByChunkName[k].match(/(css|js)*$/)[0]] = output.publicPath +
              newData.assetsByChunkName[k];
          }
          newData.entries[k] = item;
        });

        delete newData.entries.assets;
        delete newData.modules;
        delete newData.assetsByChunkName;
        return JSON.stringify(newData, null, 2);
      },
    }),
    new webpack.optimize.UglifyJsPlugin({
      test: /\.js$/,
    }),
    new CompressionPlugin({
      asset: '{file}.gz',
      algorithm: 'gzip',
      test: vars.regexAssetsToGzip,
      minRatio: 0.9,
    })
  );
}

module.exports = {
  entry,
  output,
  plugins,
  devtool: 'cheap-module-source-map',
  resolve: {
    root: paths.assetPath,
  },
  module: {
    loaders: [
      cssLoader,
      imgLoader,
      iconFontLoader,
      jsBabelLoader,
    ],
  },
  postcss: [
    autoprefixer({ browsers: ['last 2 versions'] }),
  ],
};

