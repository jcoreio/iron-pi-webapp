exports.NODE_ENV = 'development'
exports.WEBPACK_DEVTOOL = 'eval'
exports.BACKEND_PORT = '3000'
exports.PORT = '4000'
exports.ROOT_URL = `http://localhost:${process.env.PORT || exports.PORT}`
exports.ROOT_URL_FOR_BATTSIM = `http://docker.for.mac.localhost:${process.env.PORT || exports.PORT}`
exports.REPLIFY = '1'

