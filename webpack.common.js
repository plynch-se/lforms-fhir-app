// TBD - trying to get webpack-dev-server working
const MomentLocalesPlugin = require('moment-locales-webpack-plugin'); // Excludes momentjs locales.
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
//const HtmlWebpackIncludeAssetsPlugin = require('html-webpack-include-assets-plugin');

var cfg = {
  node: {
    fs: "empty"
  },
  output: {
//      publicPath: '/lforms-fhir-app/',
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
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
    },
  }
}
cfg.devtool = 'source-map';
cfg.devServer = {
 // publicPath: '/lforms-fhir-app/'
};
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
let nameFormat = '[name]_[hash].[ext]';
cfg.module.rules.push({
  test: /glyphicons.*\.(eot|svg|ttf|woff2?)$/,
  use: [{
    loader: 'file-loader',
    options: {
      name: nameFormat,
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
      name: nameFormat,
      outputPath: 'styles/images',
      publicPath: 'images'
    }
  }]
});


function makeConfigs(env) {
  let appConfig = cfg;
  appConfig.entry = './app/app.js';
  appConfig.output.filename = '[name].[contenthash].js',
  appConfig.plugins.push(new CleanWebpackPlugin({verbose: true}));
  appConfig.plugins.push(new HtmlWebpackPlugin({template: 'app/index.html'}));
  appConfig.plugins.push(new HtmlWebpackPlugin({template: 'app/launch.html',
    filename: 'launch.html'}));
/*    appConfig.plugins.push(new HtmlWebpackIncludeAssetsPlugin({
    assets: [{ path: 'dist/lforms-fhir-app', glob: 'vendor*.js', globPath:
      'dist/lforms-fhir-app' }],
    assets: [{ path: 'dist/lforms-fhir-app', glob: 'vendor*.css', globPath:
      'dist/lforms-fhir-app' }]
  }));*/
  appConfig.plugins.push(
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash].css'
    })
  );
  return appConfig;
}
module.exports = makeConfigs();
