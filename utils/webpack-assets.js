/* eslint strict: 0, prefer-rest-params: 0 */

'use strict';

const fs = require('fs');
const path = require('path');

function extend(target) {
  const sources = [].slice.call(arguments, 1);
  sources.forEach((source) => {
    for (let i = 0; i < sources.length; i++) {
      target[i] = source[i];
    }
  });
  return target;
}

module.exports = (manifestPath, options) => {
  let manifest = null;
  let isManifestLoaded = false;

  options = options || {
    devMode: false,
  };

  function loadManifest() {
    try {
      let data = {};
      if (fs.statSync(manifestPath).isDirectory()) {
        const manifestFiles = fs.readdirSync(manifestPath);
        if (manifestFiles.length === 0) {
          console.error('there are no asset manifest');
        }
        manifestFiles.forEach((manif) => {
          extend(data, JSON.parse(fs.readFileSync(path.resolve(manifestPath, manif), 'utf8')));
        });
      } else {
        data = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      }

      isManifestLoaded = true;
      return data;
    } catch (e) {
      console.log('could not load asset manifest', e);
    }
    return null;
  }

  function getAsset(type, path) {
    if (options.devMode) return path;
    if (!isManifestLoaded) manifest = loadManifest();
    if (manifest && manifest[type]) return manifest[type][path];
    return path;
  }

  function getAssetUrl(path) {
    return getAsset('assets', path);
  }

  function getAssetCss(path) {
    if (!getAsset('entries', path).css) return '';
    return `<link href="${getAsset('entries', path).css}" rel="stylesheet">`;
  }

  function getAssetJs(path) {
    if (!getAsset('entries', path).js) return '';
    return `<script src="${getAsset('entries', path).js}"></script>`;
  }

  return {
    webpack_asset_css: getAssetCss,
    webpack_asset_js: getAssetJs,
    webpack_asset_url: getAssetUrl,
  };
};
