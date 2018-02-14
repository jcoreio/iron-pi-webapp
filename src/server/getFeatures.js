// @flow

import type {ServerFeature} from './ServerFeature'
import {createFeature as createLocalIOFeature} from './localio/LocalIOFeature'

export default async function getFeatures(): Promise<Array<ServerFeature>> {
  return [
    createLocalIOFeature(),
  ]
}

