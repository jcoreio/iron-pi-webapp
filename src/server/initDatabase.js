// @flow

import fs from 'fs-extra'
import path from 'path'
import type Sequelize from 'sequelize'
import type Umzug from 'umzug'
import createFeatures from './createFeatures'
import createSequelize from './sequelize/index'
import databaseReady from './sequelize/databaseReady'
import createUmzug from './sequelize/umzug'
import type {DbConnectionParams} from './sequelize'
import {defaultDbConnectionParams} from './sequelize'
import copyIfNewer from './util/copyIfNewer'
import type {ServerFeature} from './ServerFeature'

export default async function initDatabase(args: {
  connectionParams?: ?DbConnectionParams,
  features?: ?Array<ServerFeature>,
} = {}): Promise<{
  sequelize: Sequelize,
  umzug: Umzug,
}> {
  const connectionParams: DbConnectionParams = args.connectionParams || defaultDbConnectionParams()
  const features: Array<ServerFeature> = args.features || (await createFeatures())
  await databaseReady()
  const sequelize = createSequelize(connectionParams || defaultDbConnectionParams())
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
