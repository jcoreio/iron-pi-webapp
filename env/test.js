var path = require('path')

exports.NODE_ENV = 'production'
exports.BABEL_ENV = 'test'
exports.WEBPACK_DEVTOOL = 'source-map'
exports.PORT = '4000'
exports.BACKEND_PORT = '4000'
exports.ROOT_URL = 'http://localhost:' + (process.env.PORT || exports.PORT)
exports.GENABILITY_BASE_URL = (process.env.ROOT_URL || exports.ROOT_URL) + '/__test__/genability'
exports.BATTSIM_BASE_URL = (process.env.ROOT_URL || exports.ROOT_URL) + '/__test__/battsim'
exports.DB_NAME = 'pasonpower_test'
exports.DYNAMO_TABLE_PREFIX = 'battmanAppTest-'
exports.LOG_GROUP_NAME = 'battmanDataConsumerTestShard'

