// @flow

import {createClient} from 'redis'
import type {RedisClient} from 'redis'
import requireEnv from '../../universal/util/requireEnv'
import RedisSubscriber from '@jcoreio/redis-subscriber'

export type {RedisSubscriber}

let _redisClient: ?RedisClient
let _redisSubscriber: ?RedisSubscriber<Object>

export function start() {
  _redisClient = createClient({
    host: requireEnv('REDIS_HOST'),
    port: parseInt(requireEnv('REDIS_PORT')),
    db: parseInt(requireEnv('REDIS_DB')),
  })
  _redisSubscriber = new RedisSubscriber(_redisClient, {parseMessage: JSON.parse})
}

export function end(flush?: boolean) {
  if (_redisClient) _redisClient.end(flush || false)
}

export default function redisSubscriber(): RedisSubscriber<Object> {
  const subscriber = _redisSubscriber
  if (!subscriber) throw new Error('redisSubscriber has not been created')
  return subscriber
}

redisSubscriber.start = start
redisSubscriber.end = end

