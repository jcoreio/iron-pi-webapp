// @flow

import emitted from 'promisify-event'
import {createClient} from 'redis'
import requireEnv from '@jcoreio/require-env'
import poll from '@jcoreio/poll'

export default function redisReady(options: {timeout?: number} = {}): Promise<any> {
  const timeout = options.timeout || 15000

  console.error('Waiting for redis to be ready...') // eslint-disable-line no-console

  return poll(
    async (): Promise<any> => {
      const client = createClient({
        host: requireEnv('REDIS_HOST'),
        port: parseInt(requireEnv('REDIS_PORT')),
        db: parseInt(requireEnv('REDIS_DB')),
      })

      try {
        await Promise.race([
          emitted(client, 'ready'),
          emitted(client, 'error'),
        ])
      } finally {
        client.end(false)
      }
    },
    1000
  ).timeout(timeout)
}
