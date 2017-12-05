exports.NODE_ENV = 'production'
exports.BABEL_ENV = 'test'
exports.WEBPACK_DEVTOOL = 'source-map'
exports.PORT = '4000'
exports.BACKEND_PORT = '4000'
exports.ROOT_URL = 'http://localhost:' + (process.env.PORT || exports.PORT)
exports.DB_NAME = 'ironpi_test'

