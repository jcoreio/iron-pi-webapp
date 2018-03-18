// @flow

import Sequelize from 'sequelize'
import requireEnv from '@jcoreio/require-env'

export type DbConnectionParams = {
  host: string,
  user: string,
  password: string,
  database: string,
}

export const defaultDbConnectionParams = (): DbConnectionParams => ({
  host: requireEnv('DB_HOST'),
  user: requireEnv('DB_USER'),
  password: requireEnv('DB_PASSWORD'),
  database: requireEnv('DB_NAME'),
})

export default function createSequelize(params: DbConnectionParams = defaultDbConnectionParams()): Sequelize {
  const {host, user, password, database} = params

  const sequelize = new Sequelize(database, user, password, {
    host,
    dialect: 'postgres'
  })

  return sequelize
}
