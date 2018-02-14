// @flow

import _ from 'lodash'
import EventEmitter from '@jcoreio/typed-event-emitter'
import {isEqual} from 'lodash'
import sparkplug from 'sparkplug-client'

import {toPluginInfo} from '../../universal/data-router/PluginConfigTypes'
import type {PluginInfo, TagMetadata, TagMetadataMap} from '../../universal/data-router/PluginConfigTypes'
import {cleanMQTTConfig, mqttConfigToDataPluginMappings} from '../../universal/mqtt/MQTTConfig'
import type {MQTTChannelConfig, MQTTConfig} from '../../universal/mqtt/MQTTConfig'
import {FEATURE_EVENT_DATA_PLUGINS_CHANGE} from '../data-router/PluginTypes'
import type {DataPlugin, DataPluginEmittedEvents, CycleDoneEvent,
  DataPluginMapping, Feature, FeatureEmittedEvents, TimestampedValuesMap} from '../data-router/PluginTypes'
import {metadataHandler, EVENT_METADATA_CHANGE} from '../metadata/MetadataHandler'
import type {MetadataChangeEvent} from '../metadata/MetadataHandler'
import {SPARKPLUG_VERSION_B_1_0} from './SparkPlugTypes'
import type {SparkPlugClient, SparkPlugDataMertic, SparkPlugPackage} from './SparkPlugTypes'

const _instances: Array<MQTTPlugin> = []

class MQTTPluginFeature extends EventEmitter<FeatureEmittedEvents> implements Feature {
  constructor() {
    super()
  }
  async createDataPlugins(): Promise<void> {
    // Read from Sequelize model and populate _instances array
  }
  getDataPlugins(): $ReadOnlyArray<DataPlugin> { return _instances }
}

export const mqttPluginFeature = new MQTTPluginFeature()

function onSequelizeInstanceAddHook() { // eslint-disable-line no-unused-vars
  mqttPluginFeature.emit(FEATURE_EVENT_DATA_PLUGINS_CHANGE)
}

type ToMQTTChannelState = {
  sentValue: any,
  curValue: any,
  txDelayed: boolean,
  txTime: number,
}

type MQTTPluginResources = {
  tagMap: () => TimestampedValuesMap,
  publicTags: () => Array<string>,
  metadata: () => TagMetadataMap,
}

export default class MQTTPlugin extends EventEmitter<DataPluginEmittedEvents> implements DataPlugin {
  _config: MQTTConfig;
  _pluginInfo: PluginInfo;
  _resources: MQTTPluginResources;

  _metadataListener: (event: MetadataChangeEvent) => void;

  _metadataToMQTT: TagMetadataMap = {}
  _tagsToMQTT: Array<string> = []

  _client: SparkPlugClient;

  _toMQTTChannelStates: Array<ToMQTTChannelState> = []

  constructor(args: {config: MQTTConfig, resources: MQTTPluginResources}) {
    super()
    this._config = cleanMQTTConfig(args.config)
    this._pluginInfo = toPluginInfo(this._config)
    this._resources = args.resources

    this._client = (sparkplug: SparkPlugPackage).newClient({
      serverUrl: 'tcp://192.168.1.72:1883',
      username: 'username',
      password: 'password',
      groupId: 'testGroupId',
      edgeNode: 'testNodeId',
      clientId: 'testClientId',
      version: SPARKPLUG_VERSION_B_1_0,
    })

    this._metadataListener = (event: MetadataChangeEvent) => this._metadataChanged()
    metadataHandler.on(EVENT_METADATA_CHANGE, this._metadataListener)
  }

  pluginInfo(): PluginInfo { return this._pluginInfo }

  ioMappings(): Array<DataPluginMapping> {
    // Note: In the case where "publish all public tags" is checked, we deliberately don't include
    // those tags as inputs here for two reasons: we don't know what those tags are until all other
    // plugins have been created and declared their ioMappings, and we don't need to verify that
    // those tags are populated.
    return mqttConfigToDataPluginMappings(this._config)
  }

  dispatchCycleDone(event: CycleDoneEvent) {
    // if (this._config.publishAllPublicTags || event.inputsChanged) {
    // }
  }

  start() {
    // Figure out tags
  }

  _getChannelsToMQTT(): Array<MQTTChannelConfig> {
    let publishAllChannels: Array<MQTTChannelConfig> = []
    if (this._config.publishAllPublicTags) {
      const enabledChannelsToMQTT: Array<MQTTChannelConfig> = this._config.channelsToMQTT.filter(
        (channel: MQTTChannelConfig) => channel.enabled)

      // Start with all public tags, and filter out tags that either come from this plugin,
      // or are already published by this plugin.
      const alreadyPublishedSystemTags: Array<string> = enabledChannelsToMQTT
        .map((channel: MQTTChannelConfig) => channel.internalTag)
      const alreadyPublishedMQTTTags: Array<string> = enabledChannelsToMQTT
        .map((channel: MQTTChannelConfig) => channel.mqttTag)
      const internalTagsFromThisPlugin = this._config.channelsFromMQTT
        .filter((channel: MQTTChannelConfig) => channel.enabled)
        .map((channel: MQTTChannelConfig) => channel.internalTag)
      const publicTagsNotFromThisPlugin = _.difference(this._resources.publicTags(), internalTagsFromThisPlugin)
      const unPublishedPublicTags = _.difference(publicTagsNotFromThisPlugin, alreadyPublishedSystemTags)
      // Don't publish tags where the MQTT tag path is already being published to
      const tagsToPublish = _.difference(unPublishedPublicTags, alreadyPublishedMQTTTags)
      publishAllChannels = tagsToPublish.map((tag: string) => ({
        internalTag: tag,
        mqttTag: tag,
        enabled: true
      }))
    }
    return [...this._config.channelsToMQTT, ...publishAllChannels]
  }

  destroy() {
    metadataHandler.removeListener(EVENT_METADATA_CHANGE, this._metadataListener)
  }

  _metadataChanged() {
    const metadataToMQTT = this._calcMetadataToMQTT(this._resources.metadata())
    if (!isEqual(metadataToMQTT, this._metadataToMQTT)) {
      this._metadataToMQTT = metadataToMQTT
      this._publishNodeBirth()
    }
  }

  _calcMetadataToMQTT(metadata: TagMetadataMap): TagMetadataMap {
    const metadataToMQTT = {}
    this._tagsToMQTT.forEach((tag: string) => {
      const metadataForTag: ? TagMetadata = metadata[tag]
      if (metadataForTag)
        metadataToMQTT[tag] = metadataForTag
    })
    return metadataToMQTT
  }

  _generateDataMessage(opts: {sendAll?: ?boolean} = {}): Array<SparkPlugDataMertic> {
    return []
  }

  /**
   * Send a SparkPlugin NBIRTH message on connect or when metadata changes
   * @private
   */
  _publishNodeBirth() {

  }
}
