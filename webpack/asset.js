// This is to recursively require all the assets
// Note: You can't require other files here since this is only for
// webpack assets management
/* global __CONTEXT_ASSETS_PATH__, __ASSETS_EXTENSIONS__ */

function requireAll(r) { r.keys().forEach(r); }
requireAll(require.context(__CONTEXT_ASSETS_PATH__, true, __ASSETS_EXTENSIONS__));

