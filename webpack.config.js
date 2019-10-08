function commonConfig() {
  return {
    node: {
      fs: "empty"
    },
    output: {
      path: __dirname,
    },
    module: {
      rules: [
        {
          test: /\.m?js$/,
          // exclude: /(node_modules|bower_components)/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [['@babel/preset-env',
                {
                  "targets": {
                    "browsers": "ie >= 10"
                  }
                }
              ]]
            }
          }
        }
      ]
    }
  }
}

function makeConfigs(env) {

  const MomentLocalesPlugin = require('moment-locales-webpack-plugin'); // Excludes momentjs locales.
  const { CleanWebpackPlugin } = require('clean-webpack-plugin');

  let configs = [];

  let appConfig = commonConfig();
  appConfig.entry = './app/app.js';
  //appConfig.output.filename = require('path').resolve(__dirname,
  //  './dist/lforms-fhir-app/app.js');
  appConfig.output.path = require('path').resolve(__dirname,
    './dist/lforms-fhir-app');
  appConfig.output.filename = '[name]_[hash].js';
  appConfig.devtool = 'source-map';
  appConfig.mode = 'production';
  const MiniCssExtractPlugin = require("mini-css-extract-plugin");
  appConfig.plugins = [
    new MiniCssExtractPlugin({
      filename: "[name]_[hash].css"
    }),
    new MomentLocalesPlugin(),
    new CleanWebpackPlugin()
  ];
  appConfig.module.rules.push({
    test: /\.css$/,
  //  include: /node_modules/,
    use: [
      {
        // This loader creates one CSS file per JS file that contains CSS.
        // Or so the documentation says.  It seems to just create one file.
        loader: MiniCssExtractPlugin.loader,
        options: {
          outputPath: 'styles',
        }
      },
      //'style-loader', // for devlopment only
      'css-loader' // resolves paths for CSS files in require/import
    ]
  });
  appConfig.module.rules.push({
    test: /glyphicons.*\.(eot|svg|ttf|woff2?)$/,
    use: [{
      loader: 'file-loader',
      options: {
        name: '[name]_[hash].[ext]',
        outputPath: 'styles/fonts',
        publicPath: 'fonts'
      }
    }]
  });
  appConfig.module.rules.push({
    test: /\.(png|svg|jpg|gif)$/,
    use: [{
      loader: 'file-loader',
      options: {
        name: '[name]_[hash].[ext]',
        outputPath: 'styles/images',
        publicPath: 'images'
      }
    }]
  });
  configs.push(appConfig);

  return configs;
}
module.exports = makeConfigs;
