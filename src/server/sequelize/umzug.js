// @flow

import Sequelize from 'sequelize'
import Umzug from 'umzug'
import logger from 'log4jcore'

const log = logger('sequelize:migrate')

type Options = {
  sequelize: Sequelize,
  migrationsDir: string,
}

export default function createUmzug({sequelize, migrationsDir}: Options): Umzug {
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


