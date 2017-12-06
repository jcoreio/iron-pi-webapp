exports.BABEL_ENV = 'test'
exports.WEBPACK_DEVTOOL = 'source-map'
exports.REDIS_HOST = 'localhost'
exports.REDIS_PORT = '6379'
exports.REDIS_DB = '9'
exports.DB_HOST = 'localhost'
exports.DB_USER = 'root'
exports.DB_NAME = 'ironpi_test'
exports.DB_PASSWORD = 'password'
exports.PORT = '4000'
exports.ROOT_URL = `http://localhost:${process.env.PORT || exports.PORT}`

