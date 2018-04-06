// @flow

import path from 'path'
import promisify from 'es6-promisify'
import glob from 'glob'
import {debounce} from 'lodash'
import logger from 'log4jcore'
import type {DataPlugin, Feature, FeatureEmittedEvents} from '../data-router/PluginTypes'
import EventEmitter from '@jcoreio/typed-event-emitter/index'
import MQTTPlugin, {MQTT_PLUGIN_EVENT_STATE_CHANGE} from './MQTTPlugin'
import type {MQTTPluginResources} from './MQTTPlugin'
import SequelizeMQTTConfig from './models/MQTTConfig'
import SequelizeMQTTChannelConfig from './models/MQTTChannelConfig'
import type Sequelize from 'sequelize'
import addTypes from './graphql/types/addTypes'
import addQueryFields from './graphql/query/addQueryFields'
import addMutationFields from './graphql/mutation/addMutationFields'
import addSubscriptionFields from './graphql/subscription/addSubscriptionFields'
import {FEATURE_EVENT_DATA_PLUGINS_CHANGE} from '../data-router/PluginTypes'
import {MQTT_PLUGIN_STATE_CHANGE} from './graphql/subscription/constants'
import type {MQTTPluginState} from '../../universal/types/MQTTPluginState'

const log = logger('MQTTFeature')

export default class MQTTFeature extends EventEmitter<FeatureEmittedEvents> implements Feature {
  _dataPlugins: Map<number, MQTTPlugin> = new Map()
  _resources: MQTTPluginResources

  async createDataPlugins(resources: MQTTPluginResources): Promise<void> {
    this._resources = resources
    const configInstances = await SequelizeMQTTConfig.findAll({
      include: [
        {association: SequelizeMQTTConfig.ChannelsFromMQTT},
        {association: SequelizeMQTTConfig.ChannelsToMQTT},
      ]
    })
    for (let instance of configInstances) {
      this._createDataPlugin(instance, {emitChange: false})
    }
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
  addSubscriptionFields = addSubscriptionFields(this)

  getDataPlugin(id: number): ?MQTTPlugin {
    return this._dataPlugins.get(id)
  }

  getDataPlugins(): $ReadOnlyArray<DataPlugin> { return [...this._dataPlugins.values()] }

  _emitPluginsChanged = debounce(() => this.emit(FEATURE_EVENT_DATA_PLUGINS_CHANGE), 1000)

  _destroyDataPlugin(id: number, {emitChange}: {emitChange?: boolean} = {}) {
    const plugin = this._dataPlugins.get(id)
    if (plugin) {
      plugin.removeAllListeners()
      plugin.destroy()
    }
    this._dataPlugins.delete(id)
    if (emitChange !== false) this._emitPluginsChanged()
  }

  _createDataPlugin(instance: SequelizeMQTTConfig, {emitChange}: {emitChange?: boolean} = {}) {
    this._destroyDataPlugin(instance.id, {emitChange: false})
    const resources = this._resources
    try {
      const plugin = new MQTTPlugin({
        config: (instance.get({plain: true, raw: true}): any),
        resources,
      })
      plugin.on(MQTT_PLUGIN_EVENT_STATE_CHANGE, this._handleMQTTPluginStateChange)
      this._dataPlugins.set(instance.id, plugin)
      this._handleMQTTPluginStateChange(plugin.getState())
      if (emitChange !== false) this._emitPluginsChanged()
    } catch (error) {
      log.error(`could not create MQTT plugin instance: ${error.stack}`)
    }
  }

  _handleMQTTPluginStateChange = (state: MQTTPluginState) => {
    this._resources.pubsub.publish(`${MQTT_PLUGIN_STATE_CHANGE}/${state.id}`, {MQTTPluginState: state})
  }

  _handleMQTTConfigCreatedOrUpdated = async (instance: SequelizeMQTTConfig) => {
    const instanceWithChannels = await SequelizeMQTTConfig.findById(instance.id, {
      include: [
        {association: SequelizeMQTTConfig.ChannelsFromMQTT},
        {association: SequelizeMQTTConfig.ChannelsToMQTT},
      ]
    })
    if (instanceWithChannels)
      this._createDataPlugin(instanceWithChannels)
    else
      log.error(`could not fetch MQTT plugin config with channels for instance ${instance.id}`)
  }

  _handleMQTTConfigDestroyed = (instance: SequelizeMQTTConfig) => {
    this._destroyDataPlugin(instance.id)
  }

  _handleMQTTChannelConfigChange = async (instance: SequelizeMQTTChannelConfig) => {
    const config = await instance.getConfig({
      include: [
        {association: SequelizeMQTTConfig.ChannelsFromMQTT},
        {association: SequelizeMQTTConfig.ChannelsToMQTT},
      ]
    })
    if (config) this._createDataPlugin(config)
  }

  async start(): Promise<void> {
    SequelizeMQTTConfig.addHook('afterCreate', 'MQTTFeature._handleMQTTConfigCreated', this._handleMQTTConfigCreatedOrUpdated)
    SequelizeMQTTConfig.addHook('afterUpdate', 'MQTTFeature._handleMQTTConfigUpdated', this._handleMQTTConfigCreatedOrUpdated)
    SequelizeMQTTConfig.addHook('afterDestroy', 'MQTTFeature._handleMQTTConfigDestroyed', this._handleMQTTConfigDestroyed)
    SequelizeMQTTChannelConfig.addHook('afterCreate', 'MQTTFeature._handleMQTTChannelConfigCreated', this._handleMQTTChannelConfigChange)
    SequelizeMQTTChannelConfig.addHook('afterUpdate', 'MQTTFeature._handleMQTTChannelConfigUpdated', this._handleMQTTChannelConfigChange)
    SequelizeMQTTChannelConfig.addHook('afterDestroy', 'MQTTFeature._handleMQTTChannelConfigDestroyed', this._handleMQTTChannelConfigChange)
  }
  async stop(): Promise<void> {
    SequelizeMQTTConfig.removeHook('afterCreate', 'MQTTFeature._handleMQTTConfigCreated')
    SequelizeMQTTConfig.removeHook('afterUpdate', 'MQTTFeature._handleMQTTConfigUpdated')
    SequelizeMQTTConfig.removeHook('afterDestroy', 'MQTTFeature._handleMQTTConfigDestroyed')
    SequelizeMQTTChannelConfig.removeHook('afterCreate', 'MQTTFeature._handleMQTTChannelConfigCreated')
    SequelizeMQTTChannelConfig.removeHook('afterUpdate', 'MQTTFeature._handleMQTTChannelConfigUpdated')
    SequelizeMQTTChannelConfig.removeHook('afterDestroy', 'MQTTFeature._handleMQTTChannelConfigDestroyed')
  }
}

export function createFeature(): MQTTFeature {
  return new MQTTFeature()
}

