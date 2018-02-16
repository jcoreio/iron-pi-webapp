// @flow

import type {DataPlugin, Feature, FeatureEmittedEvents} from '../data-router/PluginTypes'
import EventEmitter from '@jcoreio/typed-event-emitter/index'
import MQTTPlugin from './MQTTPlugin'

export default class MQTTFeature extends EventEmitter<FeatureEmittedEvents> implements Feature {
  _dataPlugins: Array<MQTTPlugin>

  async createDataPlugins(): Promise<void> {
    // Read from Sequelize model and populate _instances array
  }
  getDataPlugins(): $ReadOnlyArray<DataPlugin> { return this._dataPlugins }
}

export function createFeature(): MQTTFeature {
  return new MQTTFeature()
}

