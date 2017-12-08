// @flow

import path from 'path'
import fs from 'fs'

import promisify from 'es6-promisify'
import Sequelize from 'sequelize'
import {Client} from 'pg'
import Umzug from 'umzug'

import sequelize, {dbConnectionParams} from './index'
import logger from '../../universal/logger'

const log = logger('sequelize:migrate')

const migrationsDir = path.resolve(__dirname, 'migrations')

export const umzug = new Umzug({
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
const storage = umzug.storage

export default async function migrate(): Promise<void> {
  log.info('Starting database migration...')

  const {host, user, password, database} = dbConnectionParams()
  const client = new Client({host, user, password, database: user})
  await client.connect()

  const {rowCount: databaseExists} = await client.query(
    `SELECT 1 FROM pg_database WHERE datname = $1::text`, [database]
  )
  if (!databaseExists) {
    log.info('Creating database...')
    await client.query(`CREATE DATABASE ${database}`)
  }

  try {
    const migrations = await storage.executed()
    const migrationFiles = (await promisify(fs.readdir)(migrationsDir)).sort()
    if (!migrations.length) {
      await sequelize.sync()
      for (let migration of migrationFiles) await storage.logMigration(migration)
    } else {
      await umzug.up()
    }

    log.info('Successfully migrated SQL Database')
  } catch (error) {
    console.error(error.stack) // eslint-disable-line no-console
    throw error
  }
}

