const svgr = require('@svgr/rollup');

module.exports = {
  rollup(config) {
    config.plugins = [
      svgr({ typescript: true }),
      ...config.plugins,
    ];

    return config;
  },
};
