// @flow

import path from 'path'
import promisify from 'es6-promisify'
import glob from 'glob'
import {range} from 'lodash'
import type {DataPlugin, Feature, FeatureEmittedEvents} from '../data-router/PluginTypes'
import EventEmitter from '@jcoreio/typed-event-emitter/index'
import MQTTPlugin from './MQTTPlugin'
import type {MQTTPluginResources} from './MQTTPlugin'
import type {PluginInfo} from '../../universal/data-router/PluginConfigTypes'
import type {MQTTConfig} from '../../universal/mqtt/MQTTConfig'
import SignalGenerator from '../sim/SignalGenerator'
import type {SignalGeneratorConfig} from '../sim/SignalGenerator'
import SequelizeMQTTConfig from './models/MQTTConfig'
import SequelizeMQTTChannelConfig from './models/MQTTChannelConfig'
import type Sequelize from 'sequelize'
import addTypes from './graphql/types/addTypes'
import addQueryFields from './graphql/query/addQueryFields'
import addMutationFields from './graphql/mutation/addMutationFields'

export default class MQTTFeature extends EventEmitter<FeatureEmittedEvents> implements Feature {
  _dataPlugins: Array<DataPlugin> = []

  async createDataPlugins(resources: MQTTPluginResources): Promise<void> {
    // Read from Sequelize model and populate _instances array
    const mqttConfig: MQTTConfig = {
      serverURL: 'tcp://localhost:1883',
      username: 'username',
      password: 'password',
      groupId: 'testGroupId',
      nodeId: 'testNodeId',
      minPublishInterval: 300,
      publishAllPublicTags: true
    }
    const mqttPluginInfo: PluginInfo = {
      pluginType: 'mqtt',
      pluginId: 'mqtt0',
      pluginName: mqttConfig.name || 'MQTT Instance 1'
    }
    this._dataPlugins.push(new MQTTPlugin({pluginInfo: mqttPluginInfo, config: mqttConfig, resources}))

    const signalGeneratorConfig: SignalGeneratorConfig = {
      interval: 100,
      channels: range(8).map((idx: number) => ({
        tag: `channel${idx + 1}`,
        offset: idx * 5000
      }))
    }
    const simPluginInfo: PluginInfo = {
      pluginType: 'signalGenerator',
      pluginId: 'signalGenerator0',
      pluginName: 'Signal Generator'
    }
    this._dataPlugins.push(new SignalGenerator({pluginInfo: simPluginInfo, config: signalGeneratorConfig}))
  }

  async getMigrations(): Promise<Array<string>> {
    return promisify(glob)(path.join(__dirname, 'migrations', '*.js'))
  }
  addSequelizeModels({sequelize}: {sequelize: Sequelize}) {
    SequelizeMQTTConfig.initAttributes({sequelize})
    SequelizeMQTTChannelConfig.initAttributes({sequelize})
    SequelizeMQTTConfig.initAssociations()
    SequelizeMQTTChannelConfig.initAssociations()
  }
  addTypes = addTypes(this)
  addQueryFields = addQueryFields(this)
  addMutationFields = addMutationFields(this)

  getDataPlugins(): $ReadOnlyArray<DataPlugin> { return this._dataPlugins }
}

export function createFeature(): MQTTFeature {
  return new MQTTFeature()
}

