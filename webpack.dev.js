const commonConfig = require('./webpack.common');
const merge = require('webpack-merge');

const config = merge(commonConfig, {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    publicPath: '/lforms-fhir-app/'
  }
});

console.log(JSON.stringify(config, null, 2));
module.exports = merge(config);
