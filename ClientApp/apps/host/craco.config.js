const { importMapGlobalExternals } = require('../shared/src/Tools/ImportMapGlobalLibs');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const SingleSpaAppcracoPlugin = require('craco-plugin-single-spa-application');
const { getLoader, loaderByName } = require('@craco/craco');
const appUrls = require('./src/appUrls');
const path = require('path');
const absolutePath = path.join(__dirname, './src');

console.log('importMapAll', appUrls);

const singleSpaAppPlugin = {
  plugin: SingleSpaAppcracoPlugin,
  options: {
    orgName: 'wings',
    projectName: 'host',
    entry: 'src/wings-host.tsx', //defaults to src/index.js,
    orgPackagesAsExternal: false, // defaults to false. marks packages that has @my-org prefix as external so they are not included in the bundle
    reactPackagesAsExternal: true, // defaults to true. marks react and react-dom as external so they are not included in the bundle
    minimize: false, // defaults to false, sets optimization.minimize value
  },
};

module.exports = function () {
  return {
    babel: {
      presets: ['@babel/preset-typescript'],
      plugins: [
        ['@babel/plugin-proposal-object-rest-spread'],
        ['@babel/plugin-transform-spread'],
        ['@babel/plugin-proposal-export-default-from'],
        ['@babel/plugin-proposal-decorators', { legacy: true }],
        ['@babel/plugin-proposal-class-properties', { loose: true }],
        [
          'module-resolver',
          {
            alias: {
              '~': './src',
            },
          },
        ],
      ],
      loaderOptions: babelLoaderOptions => babelLoaderOptions,
    },
    plugins: [singleSpaAppPlugin],
    webpack: {
      externals: importMapGlobalExternals,
      plugins: {
        add: [
          [
            new HtmlWebpackPlugin({
              inject: false,
              filename: 'index.html',
              template: path.resolve('src', 'template.html'),
              title: 'Wings Host',
              ...appUrls,
            }),
          ],
        ],
      },
      configure: webpackConfig => {
        const { isFound, match } = getLoader(webpackConfig, loaderByName('babel-loader'));

        if (isFound) {
          const include = Array.isArray(match.loader.include) ? match.loader.include : [match.loader.include];
          match.loader.include = include.concat[absolutePath];
        }
        return webpackConfig;
      },
    },
    devServer: {
      port: 9000,
      https: true,
    },
  };
};
