// @flow
import {Client} from 'pg'
import poll from '@jcoreio/poll'
import emitted from 'promisify-event'
import promisify from 'es6-promisify'

import {defaultDbConnectionParams} from './index'

export default function databaseReady(options: {timeout?: number} = {}): Promise<any> {
  const timeout = options.timeout || 15000

  const {host, user, password} = defaultDbConnectionParams()

  console.error('Waiting for database to be ready...') // eslint-disable-line no-console

  return poll(
    async (): Promise<void> => {
      const client = new Client({host, user, password, database: user})
      try {
        await Promise.race([
          emitted(client, 'error'),
          promisify(cb => client.connect(cb))(),
        ])
      } finally {
        client.end()
      }
    },
    1000
  ).timeout(timeout)
}

