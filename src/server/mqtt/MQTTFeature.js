// @flow

import type {DataPlugin, Feature, FeatureEmittedEvents} from '../data-router/PluginTypes'
import EventEmitter from '@jcoreio/typed-event-emitter/index'
import MQTTPlugin from './MQTTPlugin'
import type {MQTTPluginResources} from './MQTTPlugin'
import type {PluginInfo} from '../../universal/data-router/PluginConfigTypes'
import type {MQTTConfig} from '../../universal/mqtt/MQTTConfig'

export default class MQTTFeature extends EventEmitter<FeatureEmittedEvents> implements Feature {
  _dataPlugins: Array<MQTTPlugin> = []

  async createDataPlugins(resources: MQTTPluginResources): Promise<void> {
    // Read from Sequelize model and populate _instances array
    const config: MQTTConfig = {
      serverURL: 'tcp://localhost:1883',
      username: 'username',
      password: 'password',
      groupId: 'testGroupId',
      nodeId: 'testNodeId',
      minPublishInterval: 300,
      publishAllPublicTags: true
    }
    const pluginInfo: PluginInfo = {
      pluginType: 'mqtt',
      pluginId: 'mqtt0',
      pluginName: config.name || 'MQTT Instance 1'
    }
    this._dataPlugins.push(new MQTTPlugin({pluginInfo, config, resources}))
  }
  getDataPlugins(): $ReadOnlyArray<DataPlugin> { return this._dataPlugins }
}

export function createFeature(): MQTTFeature {
  return new MQTTFeature()
}

