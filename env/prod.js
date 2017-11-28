exports.NODE_ENV = 'production'
exports.WEBPACK_DEVTOOL = 'source-map'
exports.BACKEND_PORT = '4000'
exports.PORT = '4000'
exports.ROOT_URL = `http://localhost:${process.env.PORT || exports.PORT}`
exports.ROOT_URL_FOR_BATTSIM = `http://docker.for.mac.localhost:${process.env.PORT || exports.PORT}`

