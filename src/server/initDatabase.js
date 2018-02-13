// @flow

import promisify from 'es6-promisify'
import fs from 'fs-extra'
import _glob from 'glob'
import path from 'path'
import type Sequelize from 'sequelize'
import type Umzug from 'umzug'
import createSequelize from './sequelize/index'
import databaseReady from './sequelize/databaseReady'
import createUmzug from './sequelize/umzug'
import getFeatures from './getFeatures'
import type {DbConnectionParams} from './sequelize'
import {defaultDbConnectionParams} from './sequelize'

const glob = promisify(_glob)

export default async function initDatabase(params: DbConnectionParams = defaultDbConnectionParams()): Promise<{
  sequelize: Sequelize,
  umzug: Umzug,
}> {
  const features = await getFeatures()

  await databaseReady()

  const sequelize = createSequelize(params)
  const migrationFiles = (await glob(path.join(__dirname, 'sequelize', 'migrations', '*.js'))).concat(
    ...await features.map(feature => feature.getMigrations ? feature.getMigrations() : [])
  )
  const migrationsDir = path.join(__dirname, 'sequelize', 'migrationsTemp')
  await fs.remove(migrationsDir)
  await fs.mkdirp(migrationsDir)
  await migrationFiles.map(async file => fs.copy(file, path.join(migrationsDir, path.basename(file))))

  const umzug = createUmzug({sequelize, migrationsDir})
  return {sequelize, umzug}
}
