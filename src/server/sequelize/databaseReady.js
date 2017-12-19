// @flow
import {Client} from 'pg'
import promisify from 'es6-promisify'
import poll from '@jcoreio/poll'

import {dbConnectionParams} from './index'

export default function databaseReady(options: {timeout?: number} = {}): Promise<any> {
  const timeout = options.timeout || 15000

  const {host, user, password} = dbConnectionParams()

  console.error('Waiting for database to be ready...') // eslint-disable-line no-console

  return poll(
    promisify((context: any, cb: (error?: Error) => void) => {
      const client = new Client({host, user, password, database: user})
      client.on('error', cb)
      client.connect(cb)
    }),
    1000
  ).timeout(timeout)
}
