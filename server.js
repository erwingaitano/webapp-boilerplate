require('dotenv').config({ silent: true });
const express = require('express');
const paths = require.main.require('./config.paths');
const isDevelopment = process.env.NODE_ENV === 'development';
const port = process.env.PORT || 3000;
const app = express();

function webpackServer(application) {
  const webpack = require('webpack');
  const webpackConfig = require(paths.webpackConfig);
  const webpackDevMiddleware = require('webpack-dev-middleware');
  const webpackHotMiddleware = require('webpack-hot-middleware');
  const webpackCompiler = webpack(webpackConfig);

  application.use(webpackDevMiddleware(webpackCompiler, {
    hot: true,
    filename: webpackConfig.output.filename,
    publicPath: webpackConfig.output.publicPath,
    stats: {
      hash: false,
      version: false,
      timings: false,
      assets: true,
      colors: true,
      chunks: false,
      modules: false,
      // children: false,
      // source: false,
      // errors: true,
      // errorDetails: false,
      // warnings: false,
      // publicPath: false
      reasons: false
    }
  }));

  application.use(webpackHotMiddleware(webpackCompiler, { path: '/__webpack_hmr' }));
}

function staticAssets(application) {
  // TODO:: waiting for the gzip feature in the npm module
  const serveStatic = require('serve-static');
  application.use(serveStatic(isDevelopment ? paths.assetPath : paths.distPath, {
    setHeaders(res) {
      if (isDevelopment) return;
      res.setHeader('Cache-Control', 'public, max-age=31536000');
    }
  }));
}

// Static assets
staticAssets(app);

// Webpack Server only in dev mode
if (isDevelopment) {
  webpackServer(app);
}

// Load Controllers (routes) at the end.
// So that webpack middlewares can load manage his routes first
app.use(require(paths.controllersPath));

// Run the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
