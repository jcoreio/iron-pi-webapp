exports.NODE_ENV = 'production'
exports.WEBPACK_DEVTOOL = 'source-map'
exports.PORT = '80'
exports.BACKEND_PORT = process.env.PORT || exports.PORT
exports.ROOT_URL = `http://localhost${exports.BACKEND_PORT === 80 ? '' : `:${exports.BACKEND_PORT}`}`
exports.DB_HOST = 'localhost'
exports.DB_USER = 'postgres'
exports.DB_NAME = 'iron_pi_webapp'
exports.DB_PASSWORD = 'password'
exports.GENERATE_JWT_SECRET = '1'
