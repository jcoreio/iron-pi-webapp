// @flow
import {Client} from 'pg'

import {dbConnectionParams} from './index'

export default function databaseReady(options: {timeout?: number} = {}): Promise<void> {
  const timeout = options.timeout || 15000

  const {host, user, password} = dbConnectionParams()
  const client = new Client({host, user, password, database: user})

  console.error('Waiting for database to be ready...') // eslint-disable-line no-console

  return new Promise((resolve: () => void, reject: (error: Error) => void) => {
    const startTime = Date.now()
    let lastError
    function poll() {
      if (Date.now() - startTime >= timeout) {
        let message = "Timed out waiting for database to become ready"
        if (lastError) message += `last error: ${lastError.stack}`
        reject(new Error(message))
        return
      }

      client.connect((err: Error) => {
        if (err) {
          lastError = err
          setTimeout(poll, 2000)
        } else {
          resolve()
        }
      })
    }
    poll()
  })
}
