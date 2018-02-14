// @flow

import type {ServerFeature} from './ServerFeature'
import {createFeature as createLocalIOFeature} from './localio/LocalIOFeature'

export default async function createFeatures(): Promise<Array<ServerFeature>> {
  return [
    createLocalIOFeature(),
  ]
}

