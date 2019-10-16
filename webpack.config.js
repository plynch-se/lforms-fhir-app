const MomentLocalesPlugin = require('moment-locales-webpack-plugin'); // Excludes momentjs locales.
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackIncludeAssetsPlugin = require('html-webpack-include-assets-plugin');

/**
 *  Creates a configuration object with settings common to both vendor.js and
 *  app.js.
 */
function commonConfig() {
  var cfg = {
    node: {
      fs: "empty"
    },
    output: {
      path: require('path').resolve(__dirname, './dist/lforms-fhir-app')
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
  cfg.devtool = 'source-map';
  cfg.mode = 'production';
  cfg.plugins = [
    new MomentLocalesPlugin()
  ];
  cfg.module.rules.push({
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
  cfg.module.rules.push({
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
  cfg.module.rules.push({
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
  return cfg;
}

function makeConfigs(env) {
  let configs = [];
  if (!env  || env.build!='app') { // the signal to skip the node modules
    let vendorConfig = commonConfig(); // node modules
    vendorConfig.entry = './app/vendor.js';
    vendorConfig.output.filename = 'vendor_[hash].js',
    vendorConfig.plugins.push(new CleanWebpackPlugin({verbose: true}));
    vendorConfig.plugins.push(
      new MiniCssExtractPlugin({
        filename: "vendor_[hash].css"
      })
    );
    configs.push(vendorConfig);
  }

  if (!env  || env.build!='vendor') { // the signal to skip the node modules
    let appConfig = commonConfig();
    appConfig.entry = './app/app.js';
    appConfig.output.filename = 'app_[hash].js',
    appConfig.plugins.push(new HtmlWebpackPlugin({template: 'app/index.html'}));
    appConfig.plugins.push(new HtmlWebpackPlugin({template: 'app/launch.html'}));
    appConfig.plugins.push(new HtmlWebpackIncludeAssetsPlugin({
      assets: [{ path: 'dist/lforms-fhir-app', glob: 'vendor*.js', globPath:
        'dist/lforms-fhir-app' }],
      assets: [{ path: 'dist/lforms-fhir-app', glob: 'vendor*.css', globPath:
        'dist/lforms-fhir-app' }]
    }));
    appConfig.plugins.push(
      new MiniCssExtractPlugin({
        filename: "app_[hash].css"
      })
    );
    appConfig.externals = { // excludes packages from build
      'lforms': 'LForms'
    };
    configs.push(appConfig);
  }
  return configs;
}
module.exports = makeConfigs;
