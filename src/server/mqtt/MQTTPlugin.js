// @flow

import _ from 'lodash'
import EventEmitter from '@jcoreio/typed-event-emitter'
import {isEqual} from 'lodash'
import sparkplug from 'sparkplug-client'

import type {PluginInfo} from '../../universal/data-router/PluginConfigTypes'
import type {TagMetadataMap} from '../metadata/MetadataHandler'
import type {MetadataItem, NumericMetadataItem} from '../../universal/types/MetadataItem'
import {cleanMQTTConfig, mqttConfigToDataPluginMappings} from '../../universal/mqtt/MQTTConfig'
import type {MQTTChannelConfig, MQTTConfig} from '../../universal/mqtt/MQTTConfig'
import type {
  DataPlugin, DataPluginEmittedEvents, CycleDoneEvent,
  DataPluginMapping,
} from '../data-router/PluginTypes'
import {EVENT_METADATA_CHANGE} from '../metadata/MetadataHandler'
import type MetadataHandler from '../metadata/MetadataHandler'
import {SPARKPLUG_VERSION_B_1_0} from './SparkPlugTypes'
import type {SparkPlugBirthMetric, SparkplugTypedValue, SparkPlugClient,
  SparkPlugDataMertic, SparkPlugPackage} from './SparkPlugTypes'

type ToMQTTChannelState = {
  config: MQTTChannelConfig,
  sentValue: any,
  curValue: any,
}

export type MQTTPluginResources = {
  getTagValue: (tag: string) => any,
  publicTags: () => Array<string>,
  metadataHandler: MetadataHandler,
}

export default class MQTTPlugin extends EventEmitter<DataPluginEmittedEvents> implements DataPlugin {
  _config: MQTTConfig;
  _pluginInfo: PluginInfo;
  _resources: MQTTPluginResources;

  _client: SparkPlugClient;

  _started: boolean = false;
  _birthPublishDelayed: boolean = false;

  _metadataListener = () => this._metadataChanged();
  _metadataToMQTT: TagMetadataMap = {}

  /** Configs for enabled channels to MQTT, combined with channels that are being sent
   * because "publish all" is enabled */
  _toMQTTEnabledChannelConfigs: Array<MQTTChannelConfig> = [];
  /** Stored state on the value and TX time sent for each MQTT tag */
  _toMQTTChannelStates: Array<ToMQTTChannelState> = []
  _lastTxTime: number = 0;
  _publishDataTimeout: ?number;

  constructor(args: {pluginInfo: PluginInfo, config: MQTTConfig, resources: MQTTPluginResources}) {
    super()
    this._config = cleanMQTTConfig(args.config)
    this._pluginInfo = args.pluginInfo
    this._resources = args.resources

    const {serverURL, username, password, groupId, nodeId} = this._config
    this._client = (sparkplug: SparkPlugPackage).newClient({
      serverUrl: serverURL,
      username: username || null,
      password: password || null,
      groupId,
      edgeNode: nodeId,
      clientId: `jcore-node-${groupId}/${nodeId}`,
      version: SPARKPLUG_VERSION_B_1_0,
    })
    this._client.on('birth', () => this._publishNodeBirth())

    this._resources.metadataHandler.on(EVENT_METADATA_CHANGE, this._metadataListener)
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
    const dataMaybeChanged = this._config.publishAllPublicTags || event.inputsChanged
    // If _publishDataTimeout is set, we're already waiting on a delayed publish, so we can
    // just let the existing timeout expire
    if (dataMaybeChanged && !this._publishDataTimeout) {
      const channelsToSend: Array<ToMQTTChannelState> = this._getChannelsToSend()
      if (channelsToSend.length) {
        const timeSinceLastTx = event.time - this._lastTxTime
        const minPublishInterval = this._config.minPublishInterval || 0
        const minWaitTime = minPublishInterval > 0 ? minPublishInterval - timeSinceLastTx : 0
        if (minWaitTime > 0) {
          this._publishDataTimeout = setTimeout(() => this._doDelayedPublish(), minWaitTime)
        } else {
          this._sendDataMessage({channelsToSend, time: event.time})
        }
      }
    }
  }

  _doDelayedPublish() {
    this._publishDataTimeout = undefined
    const channelsToSend: Array<ToMQTTChannelState> = this._getChannelsToSend()
    if (channelsToSend.length)
      this._sendDataMessage({channelsToSend, time: Date.now()})
  }

  _sendDataMessage(args: {channelsToSend: Array<ToMQTTChannelState>, time: number}) {
    const {channelsToSend, time} = args
    this._client.publishNodeData({
      timestamp: time,
      metrics: this._generateDataMessage(channelsToSend)
    })
    this._lastTxTime = args.time
  }

  _getChannelsToSend(opts: {sendAll?: ?boolean} = {}): Array<ToMQTTChannelState> {
    // Note: This filter() call is intended to mutate _toMQTTChannelStates and return the
    // ones that need to be sent
    return this._toMQTTChannelStates.filter((state: ToMQTTChannelState) => {
      state.curValue = this._resources.getTagValue(state.config.internalTag)
      // Return the filtering result:
      return opts.sendAll || !_.isEqual(state.curValue, state.sentValue)
    })
  }

  _generateDataMessage(channelsToSend: Array<ToMQTTChannelState>): Array<SparkPlugDataMertic> {
    // Note: this map() call is intended to mutate the states in channelsToSend
    // and return the resulting SparkPlugDataMetrics
    return channelsToSend.map((state: ToMQTTChannelState) => {
      state.sentValue = state.curValue
      return {
        ...toSparkPlugMetric(state.curValue),
        name: state.config.mqttTag
      }
    })
  }

  start() {
    this._started = true
    this._updateChannelsToMQTT()
    this._metadataToMQTT = this._calcMetadataToMQTT()
    if (this._birthPublishDelayed) {
      this._birthPublishDelayed = false
      this._publishNodeBirth()
    }
  }

  tagsChanged() {
    this._updateChannelsToMQTT()
    this._metadataChanged()
  }

  // TODO: Ensure this is called whenever channelsToMQTT, channelsFromMQTT, or public tags
  // may have changed
  _updateChannelsToMQTT() {
    // Extra channels that need to be published in cases where publishAllPublicTags is enabled
    let extraChannelsToPublish: Array<MQTTChannelConfig> = []
    if (this._config.publishAllPublicTags) {
      const enabledChannelsToMQTT: Array<MQTTChannelConfig> = (this._config.channelsToMQTT || []).filter(
        (channel: MQTTChannelConfig) => channel.enabled)

      // Start with all public tags, and filter out tags that either come from this plugin,
      // or are already published by this plugin.
      const alreadyPublishedSystemTags: Array<string> = enabledChannelsToMQTT
        .map((channel: MQTTChannelConfig) => channel.internalTag)
      const alreadyPublishedMQTTTags: Array<string> = enabledChannelsToMQTT
        .map((channel: MQTTChannelConfig) => channel.mqttTag)
      const internalTagsFromThisPlugin = this._config.channelsFromMQTT || []
        .filter((channel: MQTTChannelConfig) => channel.enabled)
        .map((channel: MQTTChannelConfig) => channel.internalTag)
      const publicTagsNotFromThisPlugin = _.difference(this._resources.publicTags(), internalTagsFromThisPlugin)
      const unPublishedPublicTags = _.difference(publicTagsNotFromThisPlugin, alreadyPublishedSystemTags)
      // Don't publish tags where the MQTT tag path is already being published to
      const extraTagsToPublish = _.difference(unPublishedPublicTags, alreadyPublishedMQTTTags)
      extraChannelsToPublish = extraTagsToPublish.map((tag: string) => ({
        internalTag: tag,
        mqttTag: tag,
        enabled: true
      }))
    }
    // Combine configured channels with channels added due to "publish all" being enabled
    this._toMQTTEnabledChannelConfigs = [...(this._config.channelsToMQTT || []), ...extraChannelsToPublish]
      // Filter down to only enabled and mapped channels
      .filter((channelConfig: MQTTChannelConfig) => channelConfig.enabled && channelConfig.mqttTag && channelConfig.internalTag)

    const prevChannelStates = _.keyBy(this._toMQTTChannelStates, (state: ToMQTTChannelState) => state.config.mqttTag)
    this._toMQTTChannelStates = this._toMQTTEnabledChannelConfigs.map((config: MQTTChannelConfig) => ({
      curValue: undefined,
      sentValue: undefined,
      // Override curValue and sentValue with previous state, if any
      ...(prevChannelStates[config.mqttTag] || {}), // Start with the old state, if any
      // Force config to new config
      config
    }))
  }

  destroy() {
    this._resources.metadataHandler.removeListener(EVENT_METADATA_CHANGE, this._metadataListener)
    if (this._publishDataTimeout) {
      clearTimeout(this._publishDataTimeout)
      this._publishDataTimeout = undefined
    }
  }

  _metadataChanged() {
    const metadataToMQTT = this._calcMetadataToMQTT()
    if (!isEqual(metadataToMQTT, this._metadataToMQTT)) {
      this._metadataToMQTT = metadataToMQTT
      this._publishNodeBirth()
    }
  }

  _calcMetadataToMQTT(): TagMetadataMap {
    const metadataToMQTT = {}
    this._toMQTTEnabledChannelConfigs.forEach((channel: MQTTChannelConfig) => {
      const metadataForTag: ?MetadataItem = this._resources.metadataHandler.getTagMetadata(channel.internalTag)
      if (metadataForTag && metadataToMQTT[channel.mqttTag] === undefined)
        metadataToMQTT[channel.mqttTag] = metadataForTag
    })
    return metadataToMQTT
  }

  /**
   * Send a SparkPlugin NBIRTH message on connect or when metadata changes
   * @private
   */
  _publishNodeBirth() {
    if (this._started) {
      const dataMetrics: Array<SparkPlugDataMertic> = this._generateDataMessage(this._getChannelsToSend({sendAll: true}))
      const metrics: Array<SparkPlugBirthMetric> = dataMetrics.map((dataMetric: SparkPlugDataMertic) => {
        const metadata = this._metadataToMQTT[dataMetric.name] || {}
        const {name, dataType, isDigital} = metadata
        const metric: SparkPlugBirthMetric = {
          ...dataMetric,
          properties: {
            longName: toSparkPlugString(name || dataMetric.name),
          }
        }
        if (dataType === 'number' && isDigital !== true) {
          const {min, max, units}: NumericMetadataItem = (metadata: any)
          metric.properties.min = toSparkPlugNumber(min)
          metric.properties.max = toSparkPlugNumber(max)
          metric.properties.units = toSparkPlugString(units)
        }
        return metric
      })
      this._client.publishNodeBirth({timestamp: Date.now(), metrics})
      this._lastTxTime = Date.now()
    } else {
      this._birthPublishDelayed = true
    }
  }
}

function toSparkPlugString(value: any): SparkplugTypedValue {
  return {
    type: 'string',
    value: _.isString(value) ? value : (_.isFinite(value) ? value.toString() : '')
  }
}

function toSparkPlugNumber(value: any): SparkplugTypedValue {
  return {
    type: 'number',
    value: _.isFinite(value) ? value : NaN
  }
}

function toSparkPlugMetric(value: any): SparkplugTypedValue {
  return typeof value === 'string' ? toSparkPlugString(value) : toSparkPlugNumber(value)
}
