const importMapGlobalLibs = {
  'react': 'https://unpkg.com/react@18.3.1/umd/react.production.min.js',
  'react-dom': 'https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js',
  'single-spa': 'https://cdn.jsdelivr.net/npm/single-spa@5.9.4/lib/umd/single-spa.min.js',
  '@material-ui/core': 'https://cdn.jsdelivr.net/npm/@material-ui/core@4.9.0/umd/material-ui.production.min.js',
};

const importMapGlobalExternals = (() => {
  let importMapGlobal = {};

  for (const keyName of Object.keys(importMapGlobalLibs)) {
    importMapGlobal[keyName] = `${keyName}`;
  }

  return importMapGlobal;
})();

module.exports = { importMapGlobalLibs, importMapGlobalExternals };
