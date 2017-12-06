exports.NODE_ENV = 'development'
exports.WEBPACK_DEVTOOL = 'eval'
exports.PORT = '4000'
exports.ROOT_URL = `http://localhost:${process.env.PORT || exports.PORT}`
exports.BACKEND_PORT = String(parseInt(process.env.PORT || exports.PORT) - 1000)
exports.REPLIFY = '1'

