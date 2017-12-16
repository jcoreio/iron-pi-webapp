// @flow

import {Client} from 'pg'

import {dbConnectionParams} from '../src/server/sequelize'

export default async function dropDatabase(): Promise<void> {
  const {host, user, password, database} = dbConnectionParams()
  const client = new Client({host, user, password, database: user})
  await client.connect()
  await client.query(`DROP DATABASE IF EXISTS ${database}`)
}

