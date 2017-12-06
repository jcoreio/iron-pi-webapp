exports.NODE_ENV = 'production'
exports.WEBPACK_DEVTOOL = 'source-map'
exports.PORT = '4000'
exports.BACKEND_PORT = process.env.PORT || exports.PORT
exports.ROOT_URL = `http://localhost:${process.env.PORT || exports.PORT}`

