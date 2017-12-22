// @flow

import {Client} from 'pg'
import umzug from './umzug'
import promisify from 'es6-promisify'

import sequelize, {dbConnectionParams} from './index'
import logger from '../../universal/logger'

const log = logger('sequelize:migrate')

const storage = umzug.storage

export default async function migrate(): Promise<void> {
  log.info('Starting database migration...')

  const {host, user, password, database} = dbConnectionParams()
  const client = new Client({host, user, password, database: user})
  await promisify(cb => client.connect(cb))()

  const {rowCount: databaseExists} = await client.query(
    `SELECT 1 FROM pg_database WHERE datname = $1::text`, [database]
  )
  if (!databaseExists) {
    log.info('Creating database...')
    await client.query(`CREATE DATABASE ${database}`)
  }

  try {
    const executed = await umzug.executed()
    if (!executed.length) {
      await sequelize.sync()
      for (let migration of await umzug.pending()) await storage.logMigration(migration.file)
    } else {
      await umzug.up()
    }

    log.info('Successfully migrated SQL Database')
  } catch (error) {
    console.error(error.stack) // eslint-disable-line no-console
    throw error
  }
}

