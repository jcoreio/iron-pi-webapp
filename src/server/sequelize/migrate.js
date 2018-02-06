// @flow

import {Client} from 'pg'
import type Sequelize from 'sequelize'
import type Umzug from 'umzug'
import promisify from 'es6-promisify'
import range from 'lodash.range'
import requireEnv from '@jcoreio/require-env'
import logger from 'log4jcore'

import Channel from '../models/Channel'
import User from '../models/User'
import Scope from '../models/Scope'

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

  if (!(await Channel.findOne())) {
    await Channel.bulkCreate(range(1, 9).map(id => ({
      id,
      channelId: `channel${id}`,
      name: `Channel ${id}`,
    })))
  }

  if (process.env.BABEL_ENV === 'test') {
    const username = requireEnv('TEST_USERNAME')
    const password = requireEnv('TEST_PASSWORD')
    if (!(await User.findOne({where: {username}}))) {
      const testUser = await User.create({username, password})
      // $FlowFixMe
      await testUser.addScopes(await Scope.findAll({where: {id: ['test:create:token', 'test:update:channelStates']}}))
    } else {
      await User.update({password}, {where: {username}, individualHooks: true})
    }

    if (!(await User.findOne({where: {username: 'root'}}))) {
      await User.create({username: 'root', password})
    } else {
      await User.update({password}, {where: {username: 'root'}, individualHooks: true})
    }
  }
  if (process.env.NODE_ENV === 'development') {
    if (!(await User.findOne({where: {username: 'root'}}))) {
      await User.create({username: 'root', password: 'correct horse battery staple'})
    }
  }
}
