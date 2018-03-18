// @flow

import type Sequelize from 'sequelize'
import type Umzug from 'umzug'
import createSequelize from './sequelize/index'
import databaseReady from './sequelize/databaseReady'
import createUmzug from './sequelize/umzug'
import type {DbConnectionParams} from './sequelize'
import {defaultDbConnectionParams} from './sequelize'

export default async function initDatabase(args: {
  connectionParams?: ?DbConnectionParams,
} = {}): Promise<{
  sequelize: Sequelize,
  umzug: Umzug,
}> {
  const connectionParams: DbConnectionParams = args.connectionParams || defaultDbConnectionParams()
  await databaseReady()
  const sequelize = createSequelize(connectionParams || defaultDbConnectionParams())

  const umzug = createUmzug({sequelize})
  return {sequelize, umzug}
}

