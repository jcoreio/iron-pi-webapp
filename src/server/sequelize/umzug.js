// @flow

import path from 'path'

import Sequelize from 'sequelize'
import Umzug from 'umzug'

import sequelize from './index'
import logger from '../../universal/logger'

const log = logger('sequelize:migrate')

const migrationsDir = path.resolve(__dirname, 'migrations')

module.exports = new Umzug({
  logging: log.info.bind(log),
  storage: 'sequelize',
  storageOptions: {
    sequelize
  },
  migrations: {
    params: [sequelize.getQueryInterface(), Sequelize],
    path: migrationsDir,
  }
})


