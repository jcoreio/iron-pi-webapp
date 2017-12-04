const path = require('path')
const webpack = require('webpack')
const AssetsPlugin = require('assets-webpack-plugin')
const HappyPack = require('happypack')
const ProgressPlugin = require('webpack/lib/ProgressPlugin')
// const blessPlugin = require('bless-webpack-plugin')
const ExtractTextPlugin = require("extract-text-webpack-plugin")
const defines = require('./defines')
const babelOptions = require('./babelOptions')
const babelInclude = require('./babelInclude')

const root = path.resolve(__dirname, '..')

const vendor = [
  'babel-polyfill',
  'react',
  'react-dom',
]

const {BUILD_DIR} = process.env
if (!BUILD_DIR) throw new Error('missing process.env.BUILD_DIR')

const config = {
  context: root,
  devtool: process.env.WEBPACK_DEVTOOL,
  entry: {
    vendor,
    app: './src/client/index.js',
  },
  output: {
    filename: '[name]_[chunkhash].js',
    chunkFilename: '[name]_[chunkhash].js',
    path: path.join(BUILD_DIR, 'assets'),
    publicPath: '/assets/',
  },
  plugins: [
    new webpack.NamedModulesPlugin(),
    new webpack.optimize.CommonsChunkPlugin({
      names: ['vendor', 'manifest'],
      minChunks: Infinity,
    }),
    new webpack.optimize.AggressiveMergingPlugin(),
    new webpack.optimize.MinChunkSizePlugin({ minChunkSize: 50000 }),
    new webpack.NoEmitOnErrorsPlugin(),
    new AssetsPlugin({ path: process.env.BUILD_DIR, filename: 'assets.json' }),
    new webpack.DefinePlugin({
      ...defines,
      '__CLIENT__': true,
      '__SERVER__': false,
    }),
    new webpack.IgnorePlugin(/\/server\//),
    new ExtractTextPlugin('[name].css'),
    // bless plugin is freezing webpack at the optimizing chunk assets stage!
    // blessPlugin({ imports: true, compress: true }),
    new HappyPack({
      loaders: [{
        loader: 'babel-loader',
        options: babelOptions,
      }],
      threads: 4,
    }),
  ],
  node: {
    process: false,
  },
  module: {
    rules: [
      { test: /\.json$/, loader: 'json-loader'},
      { test: /\.txt$/, loader: 'raw-loader' },
      {
        test: /\.(png|jpg|jpeg|gif|svg|woff|woff2)$/,
        use: [
          {
            loader: 'url-loader',
            options: {limit: 10000},
          }
        ]
      },
      { test: /\.(eot|ttf|wav|mp3)$/, loader: 'file-loader' },
      {test: /\.css$/, use: ['style-loader', 'css-loader']},
      {
        test: /\.s[ac]ss$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            {
              loader: 'css-loader',
              options: {
                minimize: false,
                importLoaders: 1,
                localIdentName: '[name]_[local]_[hash:base64:5]',
              }
            },
            {loader: 'resolve-url-loader'},
            {loader: 'sass-loader', options: {sourceMap: true}},
          ]
        }),
      },
      {
        test: /\.js$/,
        loader: process.env.NO_HAPPYPACK ? 'babel-loader' : 'happypack/loader',
        include: babelInclude,
      },
    ],
  },
}

/* istanbul ignore next */
if (!process.env.CI) config.plugins.push(new ProgressPlugin({ profile: false }))
if (!process.env.NO_UGLIFY) {
  config.plugins.push(new webpack.optimize.UglifyJsPlugin({
    sourceMap: true,
    compressor: { warnings: false }
  }))
}

module.exports = config
