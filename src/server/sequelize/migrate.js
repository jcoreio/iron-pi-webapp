// @flow

import {Client} from 'pg'
import type Sequelize from 'sequelize'
import type Umzug from 'umzug'
import promisify from 'es6-promisify'
import logger from 'log4jcore'

const log = logger('sequelize:migrate')

type Options = {
  sequelize: Sequelize,
  umzug: Umzug,
}

export default async function migrate(options: Options): Promise<void> {
  log.info('Starting database migration...')

  const {sequelize, umzug} = options
  // $FlowFixMe
  const {host, username: user, password, database} = sequelize.config

  const client = new Client({host, user, password, database: user})

  try {
    await promisify(cb => client.connect(cb))()

    const {rowCount: databaseExists} = await client.query(
      `SELECT 1 FROM pg_database WHERE datname = $1::text`, [database]
    )
    if (!databaseExists) {
      log.info('Creating database...')
      await client.query(`CREATE DATABASE ${database}`)
    }

    try {
      await umzug.up()

      log.info('Successfully migrated SQL Database')
    } catch (error) {
      console.error(error.stack) // eslint-disable-line no-console
      throw error
    }
  } finally {
    client.end()
  }
}
