const path = require('path');
const { getLoader, loaderByName } = require('@craco/craco');
const absolutePath = path.join(__dirname, './src');

module.exports = {
  babel: {
    presets: [
      '@babel/preset-react',
      '@babel/preset-typescript',
    ],
    plugins: [
      ['@babel/plugin-proposal-object-rest-spread'],
      ['@babel/plugin-transform-spread'],
      ['@babel/plugin-proposal-export-default-from'],
      ['@babel/plugin-proposal-decorators', { 'legacy': true }],
      ['@babel/plugin-proposal-class-properties', { 'loose': true }],
      ['module-resolver', {
        'alias': {
          '~': './src',
        },
      },
      ]
    ],
    loaderOptions: babelLoaderOptions => babelLoaderOptions,
  },
  webpack: {
    configure: (webpackConfig) => {
      const { isFound, match } = getLoader(
        webpackConfig,
        loaderByName('babel-loader')
      );

      if (isFound) {
        const include = Array.isArray(match.loader.include)
          ? match.loader.include
          : [match.loader.include];
        match.loader.include = include.concat[absolutePath];
      }
      return webpackConfig;
    }
  }
};
