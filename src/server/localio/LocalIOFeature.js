// @flow

import path from 'path'
import glob from 'glob'
import promisify from 'es6-promisify'
import EventEmitter from '@jcoreio/typed-event-emitter'
import type {FeatureEmittedEvents} from '../data-router/PluginTypes'
import type {ServerFeature} from '../ServerFeature'

export class LocalIOFeature extends EventEmitter<FeatureEmittedEvents> {
  async getMigrations(): Promise<Array<string>> {
    return promisify(glob)(path.join(__dirname, 'migrations', '*.js'))
  }
}

export function createFeature(): ServerFeature {
  return new LocalIOFeature()
}


