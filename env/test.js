exports.BABEL_ENV = 'test'
exports.WEBPACK_DEVTOOL = 'source-map'
exports.DB_HOST = 'localhost'
exports.DB_USER = 'postgres'
exports.DB_NAME = 'iron_pi_webapp_test'
exports.DB_PASSWORD = 'password'
exports.PORT = '4000'
exports.ROOT_URL = `http://localhost:${process.env.PORT || exports.PORT}`

