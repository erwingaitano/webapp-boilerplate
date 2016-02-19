// This is to recursively require all the assets

function requireAll(r) { r.keys().forEach(r); }
requireAll(require.context('../app/assets', true, /\.(jpg|png|gif|svg)$/));