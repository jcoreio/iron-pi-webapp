// @flow

import {Client} from 'pg'
import type Sequelize from 'sequelize'
import type Umzug from 'umzug'
import promisify from 'es6-promisify'
import {range} from 'lodash'

import logger from '../../universal/logger'
import Channel from '../models/Channel'
import User from '../models/User'

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
  const {storage} = umzug

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
  } finally {
    client.end()
  }

  if (!(await Channel.findOne())) {
    await Channel.bulkCreate(range(1, 9).map(id => ({
      id,
      channelId: `channel${id}`,
      name: `Channel ${id}`,
    })))
  }

  if (process.env.BABEL_ENV === 'test' || process.env.NODE_ENV === 'development') {
    if (!(await User.findOne({where: {username: 'root'}}))) {
      await User.create({username: 'root', password: 'correct horse battery staple'})
    }
  }
}
