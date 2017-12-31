// @flow

import path from 'path'

import Sequelize from 'sequelize'
import Umzug from 'umzug'

import logger from '../../universal/logger'

const log = logger('sequelize:migrate')

const migrationsDir = path.resolve(__dirname, 'migrations')

type Options = {
  sequelize: Sequelize,
}

export default function createUmzug({sequelize}: Options): Umzug {
  return new Umzug({
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
}


