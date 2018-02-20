// @flow

import type {ServerFeature} from './ServerFeature'
import {createFeature as createLocalIOFeature} from './localio/LocalIOFeature'
import {createFeature as createMQTTFeature} from './mqtt/MQTTFeature'

export default async function createFeatures(): Promise<Array<ServerFeature>> {
  return [
    createLocalIOFeature(),
    createMQTTFeature(),
  ]
}

