// @flow

import path from 'path'
import fs from 'fs'

import promisify from 'es6-promisify'
import Sequelize from 'sequelize'
import mysql from 'mysql2'
import Umzug from 'umzug'

import sequelize, {dbConnectionParams} from './index'
import logger from '../../universal/logger'

const log = logger('sequelize:migrate')

const migrationsDir = path.resolve(__dirname, 'migrations')

export default async function migrate(): Promise<void> {
  log.info('Starting database migration...')

  const {host, user, password, database} = dbConnectionParams()
  const conn = mysql.createConnection({
    host,
    user,
    password,
    database: '', // Use an empty database name when creating the database
    connectTimeout: parseInt(process.env.DB_CONNECT_TIMEOUT) || undefined,
    ssl: process.env.DB_SSL || undefined,
  })
  const query = promisify((sql, cb) => conn.query(sql, cb))
  log.info('Creating database...')
  await query(`CREATE DATABASE IF NOT EXISTS ${database}`)

  try {
    const umzug = new Umzug({
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
    const migrations = await storage.executed()
    const migrationFiles = (await promisify(fs.readdir)(migrationsDir)).sort()
    if (!migrations.length) {
      await sequelize.sync()
      for (let migration of migrationFiles) await storage.logMigration(migration)
    } else {
      // we made a mistake in not using an initial migration in the past.
      const initialMigration = migrationFiles[0]
      if (migrations.indexOf(initialMigration) < 0) {
        await storage.logMigration(initialMigration)
      }
      await umzug.up()
    }

    log.info('Successfully migrated SQL Database')
  } catch (error) {
    console.error(error.stack) // eslint-disable-line no-console
    throw error
  }
}

