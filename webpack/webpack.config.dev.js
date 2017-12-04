// @flow

const path = require('path')
const webpack = require('webpack')
const HappyPack = require('happypack')
const ProgressPlugin = require('webpack/lib/ProgressPlugin')
const defines = require('./defines')

const babelOptions = require('./babelOptions')
const babelInclude = require('./babelInclude')

const root = path.resolve(__dirname, '..')
const srcDir = path.join(root, 'src')

const {BACKEND_PORT, PORT, BUILD_DIR} = process.env
if (!BACKEND_PORT) throw new Error('missing process.env.BACKEND_PORT')
if (!BUILD_DIR) throw new Error('missing process.env.BUILD_DIR')
if (!PORT) throw new Error('missing process.env.PORT')

const config = {
  context: root,
  devtool: process.env.WEBPACK_DEVTOOL,
  entry: [
    'babel-polyfill',
    'react-hot-loader/patch',
    './src/client/index.js',
    'webpack-hot-middleware/client',
  ],
  output: {
    // https://github.com/webpack/webpack/issues/1752
    filename: 'app.js',
    chunkFilename: '[name]_[chunkhash].js',
    path: path.join(BUILD_DIR, 'assets'),
    publicPath: '/assets/',
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.DefinePlugin({
      ...defines,
      '__CLIENT__': true,
      '__SERVER__': false,
    }),
    new HappyPack({
      loaders: [
        {
          loader: 'babel-loader',
          options: babelOptions,
        },
      ],
      threads: 4,
    }),
  ],
  node: {
    process: false,
  },
  module: {
    rules: [
      {test: /\.json$/, loader: 'json-loader'},
      {test: /\.txt$/, loader: 'raw-loader'},
      {
        test: /\.(png|jpg|jpeg|gif|svg|woff|woff2)$/, use: [
          {
            loader: 'url-loader',
            options: {limit: 10000},
          }
        ]
      },
      {test: /\.(eot|ttf|wav|mp3)$/, loader: 'file-loader'},
      {test: /\.css$/, use: ['style-loader', 'css-loader']},
      {
        test: /\.s[ac]ss$/, use: [
          {loader: 'style-loader'},
          {loader: 'css-loader'},
          {loader: 'sass-loader'},
        ]
      },
      {
        test: /Feature\.js$/,
        include: path.join(srcDir, 'universal', 'features'),
        loader: 'redux-features-hot-loader',
      },
      {
        test: /\.js$/,
        loader: process.env.NO_HAPPYPACK ? 'babel-loader' : 'happypack/loader',
        include: babelInclude,
      },
    ],
  },
  watch: true,
  devServer: {
    contentBase: `http://localhost:${BACKEND_PORT}`,
    publicPath: '/assets/',
    noInfo: true,
    port: PORT,
    stats: {
      colors: true,
    },
  },
}

/* istanbul ignore next */
if (!process.env.CI) config.plugins.push(new ProgressPlugin({ profile: false }))

module.exports = config


