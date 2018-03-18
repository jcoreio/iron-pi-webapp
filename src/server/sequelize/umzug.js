// @flow

import path from 'path'
import Sequelize from 'sequelize'
import Umzug from 'umzug'
import logger from 'log4jcore'

const log = logger('sequelize:migrate')

type Options = {
  sequelize: Sequelize,
}

const migrationsDir = path.join(__dirname, 'migrations')

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
      traverseDirectories: true,
    }
  })
}


