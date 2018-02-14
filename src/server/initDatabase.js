// @flow

import fs from 'fs-extra'
import path from 'path'
import type Sequelize from 'sequelize'
import type Umzug from 'umzug'
import createSequelize from './sequelize/index'
import databaseReady from './sequelize/databaseReady'
import createUmzug from './sequelize/umzug'
import getFeatures from './getFeatures'
import type {DbConnectionParams} from './sequelize'
import {defaultDbConnectionParams} from './sequelize'
import copyIfNewer from './util/copyIfNewer'

export default async function initDatabase(params: DbConnectionParams = defaultDbConnectionParams()): Promise<{
  sequelize: Sequelize,
  umzug: Umzug,
}> {
  const features = await getFeatures()

  await databaseReady()

  const sequelize = createSequelize(params)
  const featureMigrations = [].concat(
    ...await Promise.all(features.map(feature => feature.getMigrations ? feature.getMigrations() : []))
  )
  const featureMigrationsDir = path.join(__dirname, 'sequelize', 'migrations', 'features')
  await fs.mkdirp(featureMigrationsDir)
  const featureMigrationsSet = new Set(featureMigrations.map(migration => path.basename(migration)))
  const existingFeatureMigrations = await fs.readdir(featureMigrationsDir)
  await Promise.all(existingFeatureMigrations.map(async (migration: string): Promise<void> => {
    if (!featureMigrationsSet.has(migration)) {
      await fs.remove(path.join(featureMigrationsDir, migration))
    }
  }))
  await featureMigrations.map(async (src: string): Promise<any> => {
    const dest = path.join(featureMigrationsDir, path.basename(src))
    await copyIfNewer(src, dest)
  })

  const umzug = createUmzug({sequelize})
  return {sequelize, umzug}
}
