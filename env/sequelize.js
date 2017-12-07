require('babel-register')

var path = require('path')

var devEnv = require('defaultenv')([
  path.resolve(__dirname, './local.js')
], {dotenv: true})

module.exports = {
  development: {
    username: devEnv.DB_USER,
    password: devEnv.DB_PASSWORD,
    database: devEnv.DB_NAME,
    host: devEnv.DB_HOST,
    dialect: 'postgres',
  },
}

