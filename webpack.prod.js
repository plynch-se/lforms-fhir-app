const commonConfig = require('./webpack.common');
const merge = require('webpack-merge');

const config = merge(commonConfig, {
  mode: 'production'
});

console.log(JSON.stringify(config, null, 2));
module.exports = merge(config);
