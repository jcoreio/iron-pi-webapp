// @flow

import {Client} from 'pg'

import {defaultDbConnectionParams} from '../src/server/sequelize'

export default async function dropDatabase(): Promise<void> {
  const {host, user, password, database} = defaultDbConnectionParams()
  const client = new Client({host, user, password, database: user})
  await client.connect()
  await client.query(`DROP DATABASE IF EXISTS ${database}`)
}

