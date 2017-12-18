// @flow

import emitted from 'promisify-event'

import {createClient} from 'redis'
import requireEnv from '@jcoreio/require-env'

export default function redisReady(options: {timeout?: number} = {}): Promise<void> {
  const timeout = options.timeout || 15000

  console.error('Waiting for redis to be ready...') // eslint-disable-line no-console

  const client = createClient({
    host: requireEnv('REDIS_HOST'),
    port: parseInt(requireEnv('REDIS_PORT')),
    db: parseInt(requireEnv('REDIS_DB')),
  })

  return Promise.race([
    emitted(client, 'ready'),
    emitted(client, 'error'),
    new Promise((resolve, reject) => setTimeout(reject, timeout)),
  ]).catch((error: Error) => {
    client.end(false)
    throw error
  })
}
