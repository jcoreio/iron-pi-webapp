// @flow

import Sequelize from 'sequelize'
import requireEnv from '../../universal/util/requireEnv'

export type DbConnectionParams = {
  host: string,
  user: string,
  password: string,
  database: string
}

export const dbConnectionParams = (): DbConnectionParams => ({
  host: requireEnv('DB_HOST'),
  user: requireEnv('DB_USER'),
  password: requireEnv('DB_PASSWORD'),
  database: requireEnv('DB_NAME'),
})

const {host, user, password, database} = dbConnectionParams()

const sequelize = new Sequelize(database, user, password, {
  host,
  dialect: 'mysql'
})

export default sequelize
