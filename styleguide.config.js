const path = require('path')
require('babel-register')

const {
  devServer, // eslint-disable-line no-unused-vars
  ...config
} = require('./webpack/webpack.config.dev')
config.node.process = true

module.exports = {
  components: 'src/styleguide/components/**/*.js',
  webpackConfig: config,
  styleguideComponents: {
    Wrapper: path.join(__dirname, 'src/styleguide/Wrapper'),
  },
}

