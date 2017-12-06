// @flow

import redis from 'redis'

import requireEnv from '../../universal/util/requireEnv'

import type {RedisClient} from 'redis'
// import type {CollectionEventEmitter} from '../sequelize/CollectionAdapter'
// import type {CollectionEvent} from '../types/CollectionEvent'

let _redis: ?RedisClient

const _publishedCollections: Set<CollectionEventEmitter> = new Set()

export default function publishCollections(collections: Array<CollectionEventEmitter>) {
  if (!_redis) {
    _redis = redis.createClient(parseInt(requireEnv('REDIS_PORT')), requireEnv('REDIS_HOST'))
  }
  const redisClient = _redis
  collections.forEach((collection: CollectionEventEmitter) => {
    if (!_publishedCollections.has(collection)) {
      collection.on('event', (event: CollectionEvent) => {
        redisClient.publish(`collection/${collection.collectionName()}/${event.subchannel || event.id}`, JSON.stringify(event))
      })
      _publishedCollections.add(collection)
    }
  })
}
