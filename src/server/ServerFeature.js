// @flow

import type Sequelize from 'sequelize'

export type ServerFeature = {
  getMigrations?: () => Promise<Array<string>>,
  createSequelizeModels?: (sequelize: Sequelize) => any,
}

