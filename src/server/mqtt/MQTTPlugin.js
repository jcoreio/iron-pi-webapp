// @flow

import EventEmitter from '@jcoreio/typed-event-emitter'
import difference from 'lodash.difference'
import isEqual from 'lodash.isequal'
import keyBy from 'lodash.keyby'
import logger from 'log4jcore'
import type {PubSubEngine} from 'graphql-subscriptions'

import {EVENT_DATA_FROM_MQTT, EVENT_MQTT_CONNECT, EVENT_MQTT_DISCONNECT, EVENT_MQTT_ERROR} from './protocols/MQTTProtocolHandler'
import MQTTJSONHandler from './protocols/MQTTJSONHandler'
import type {MQTTProtocolHandler} from './protocols/MQTTProtocolHandler'
import SparkPlugHandler from './protocols/SparkPlugHandler'
import type {PluginInfo} from '../../universal/data-router/PluginConfigTypes'
import type {MetadataItem} from '../../universal/types/MetadataItem'
import {cleanMQTTConfig, mqttConfigToDataPluginMappings, MQTT_PROTOCOL_SPARKPLUG, MQTT_PROTOCOL_TEXT_JSON} from '../../universal/mqtt/MQTTConfig'
import type {MQTTChannelConfig, MQTTConfig} from '../../universal/mqtt/MQTTConfig'
import {DATA_PLUGIN_EVENT_DATA} from '../data-router/PluginTypes'
import type { DataPlugin, DataPluginEmittedEvents, CycleDoneEvent,
  DataPluginMapping, ValuesMap} from '../data-router/PluginTypes'
import {EVENT_METADATA_CHANGE} from '../metadata/MetadataHandler'
import type MetadataHandler from '../metadata/MetadataHandler'
import type {ValuesFromMQTTMap, DataValueToMQTT, ChannelFromMQTTConfig, MetadataValueToMQTT} from './MQTTTypes'
import * as MQTTTags from '../../universal/mqtt/MQTTTags'
import {ProtocolRequiredFieldsType} from '../../universal/mqtt/MQTTConfig'
import type {MQTTPluginState} from '../../universal/types/MQTTPluginState'
import {
  MQTT_PLUGIN_STATUS_CONNECTED,
  MQTT_PLUGIN_STATUS_CONNECTING,
  MQTT_PLUGIN_STATUS_ERROR
} from '../../universal/types/MQTTPluginState'

const log = logger('MQTTPlugin')

const DATA_FROM_MQTT_TIMEOUT_DEFAULT = 1000 * 60 // 1 minute
const DATA_FROM_MQTT_TIMEOUT_MIN = 100 // milliseconds

type ToMQTTChannelState = {
  config: MQTTChannelConfig,
  sentValue: any,
  curValue: any,
}

export type MQTTPluginResources = {
  pubsub: PubSubEngine,
  getTagValue: (tag: string) => any,
  publicTags: () => Array<string>,
  metadataHandler: MetadataHandler,
}

/**
 * Mappings from MQTT tag to config
 */
type ChannelsFromMQTTConfigMap = {
  [channelId: string]: ChannelFromMQTTConfig,
}

export const MQTT_PLUGIN_EVENT_STATE_CHANGE = 'stateChange'

type MQTTPluginEmittedEvents = {
  stateChange: [MQTTPluginState],
} & DataPluginEmittedEvents

export default class MQTTPlugin extends EventEmitter<MQTTPluginEmittedEvents> implements DataPlugin {
  _config: MQTTConfig;
  _id: number;
  _pluginInfo: PluginInfo;
  _resources: MQTTPluginResources;

  _protocolHandler: MQTTProtocolHandler;

  _metadataToMQTT: Array<MetadataValueToMQTT> = []
  _metadataToMQTTByMQTTTag: Map<string, MetadataItem> = new Map()

  _channelsFromMQTTConfigs: ChannelsFromMQTTConfigMap = {}
  // Mapping from MQTT tag to last receive timestamp
  _dataFromMQTTRxTimes: Map<string, number> = new Map()

  _channelsFromMQTTWarningsPrinted: Set<string> = new Set()

  /** Configs for enabled channels to MQTT, combined with channels that are being sent
   * because "publish all" is enabled */
  _toMQTTEnabledChannelConfigs: Array<MQTTChannelConfig> = [];
  /** Stored state on the value and TX time sent for each MQTT tag */
  _toMQTTChannelStates: Array<ToMQTTChannelState> = []
  _lastTxTime: number = 0;
  _publishDataTimeout: ?number;

  _rxMonitorInterval: ?number
  _dataFromMQTTTimeout: number

  _connected: boolean = false
  _state: MQTTPluginState

  constructor(args: {config: MQTTConfig, resources: MQTTPluginResources}) {
    super()
    const config = this._config = cleanMQTTConfig(args.config)
    this._id = config.id
    const {dataFromMQTTTimeout} = (config: any)
    this._dataFromMQTTTimeout = (dataFromMQTTTimeout && Number.isFinite(dataFromMQTTTimeout)) ?
      Math.max(DATA_FROM_MQTT_TIMEOUT_MIN, dataFromMQTTTimeout) : DATA_FROM_MQTT_TIMEOUT_DEFAULT
    ProtocolRequiredFieldsType.assert(config)
    this._pluginInfo = {
      pluginType: 'mqtt',
      pluginId: args.config.id,
      pluginName: args.config.name || `MQTT Plugin ${config.id}`
    }
    this._state = {
      id: config.id,
      status: MQTT_PLUGIN_STATUS_CONNECTING,
    }
    this._resources = args.resources

    const {protocol} = config
    switch (protocol) {
    case MQTT_PROTOCOL_SPARKPLUG: {
      const {serverURL, username, password, groupId, nodeId, dataFromMQTTTimeout} = (config: any)
      this._protocolHandler = new SparkPlugHandler({config: {serverURL, username, password, groupId, nodeId, dataFromMQTTTimeout}})
      break
    }
    case MQTT_PROTOCOL_TEXT_JSON: {
      const {serverURL, username, password, clientId, dataToMQTTTopic, metadataToMQTTTopic, dataFromMQTTTopic, dataFromMQTTTimeout} = (this._config: any)
      this._protocolHandler = new MQTTJSONHandler({config: {serverURL, username, password, clientId, dataToMQTTTopic, metadataToMQTTTopic, dataFromMQTTTopic, dataFromMQTTTimeout}})
      break
    }
    default: throw new Error(`unrecognized MQTT protocol: was ${protocol}, expected '${MQTT_PROTOCOL_SPARKPLUG}' or '${MQTT_PROTOCOL_TEXT_JSON}'`)
    }
    this._protocolHandler.on(EVENT_DATA_FROM_MQTT, (data: ValuesFromMQTTMap) => this._setValuesFromMQTT(data))
    this._protocolHandler.on(EVENT_MQTT_CONNECT, this._handleConnect)
    this._protocolHandler.on(EVENT_MQTT_DISCONNECT, this._handleDisconnect)
    this._protocolHandler.on(EVENT_MQTT_ERROR, this._handleError)
    this._resources.metadataHandler.on(EVENT_METADATA_CHANGE, this._onMetadataChange)
  }

  getState(): MQTTPluginState {
    return this._state
  }

  _setState = (newState: MQTTPluginState) => {
    this._state = newState
    this.emit(MQTT_PLUGIN_EVENT_STATE_CHANGE, this._state)
  }

  _handleConnect = () => {
    this._connected = true
    this._setState({
      id: this._config.id,
      status: MQTT_PLUGIN_STATUS_CONNECTED,
      connectedSince: Date.now().toString(),
    })
    this._publishAll()
  }

  _handleDisconnect = () => {
    this._connected = false
    this._setState({
      id: this._config.id,
      status: MQTT_PLUGIN_STATUS_ERROR,
    })

    this._dataFromMQTTRxTimes.clear()
    const valuesToPublish: ValuesFromMQTTMap = {}
    const enabledChannels = (channels: ?Array<MQTTChannelConfig>) => (channels || []).filter(channel => channel.enabled)
    for (let channelConfig: MQTTChannelConfig of enabledChannels(this._config.channelsToMQTT)) {
      valuesToPublish[MQTTTags.toMQTTValue(this._id, channelConfig.mqttTag)] = null
    }
    for (let channelConfig: MQTTChannelConfig of enabledChannels(this._config.channelsFromMQTT)) {
      valuesToPublish[channelConfig.internalTag] = null
      valuesToPublish[MQTTTags.fromMQTTValue(this._id, channelConfig.mqttTag)] = null
    }

    if (Object.keys(valuesToPublish).length)
      this.emit(DATA_PLUGIN_EVENT_DATA, valuesToPublish)
  }

  _handleError = (err: Error) => {
    this._connected = false
    this._setState({
      id: this._config.id,
      status: MQTT_PLUGIN_STATUS_ERROR,
      error: err.message,
    })
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
    const txMaybeRequired = this._connected && (this._config.publishAllPublicTags || event.inputsChanged)
    // If _publishDataTimeout is set, we're already waiting on a delayed publish, so we can
    // just let the existing timeout expire
    if (txMaybeRequired && !this._publishDataTimeout) {
      const channelsToSend: Array<ToMQTTChannelState> = this._getChannelsToSend()
      if (channelsToSend.length) {
        const timeSinceLastTx = event.time - this._lastTxTime
        const minPublishInterval = this._config.minPublishInterval || 0
        const minWaitTime = minPublishInterval > 0 ? minPublishInterval - timeSinceLastTx : 0
        if (minWaitTime > 0) {
          this._publishDataTimeout = setTimeout(() => this._doDelayedPublish(), minWaitTime)
        } else {
          this._publishData({channelsToSend, time: event.time})
        }
      }
    }
  }

  _doDelayedPublish() {
    this._publishDataTimeout = undefined
    const channelsToSend: Array<ToMQTTChannelState> = this._getChannelsToSend()
    if (channelsToSend.length)
      this._publishData({channelsToSend, time: Date.now()})
  }

  _publishData(args: {channelsToSend: Array<ToMQTTChannelState>, time: number}) {
    const {channelsToSend, time} = args

    const data: Array<DataValueToMQTT> = this._generateDataMessage(channelsToSend)
    log.info(`Publishing data to MQTT: ${JSON.stringify(data)}`)
    this._protocolHandler.publishData({data, time})
    this._lastTxTime = args.time
  }

  _getChannelsToSend(opts: {sendAll?: ?boolean} = {}): Array<ToMQTTChannelState> {
    // Note: This filter() call is intended to mutate _toMQTTChannelStates and return the
    // ones that need to be sent
    return this._toMQTTChannelStates.filter((state: ToMQTTChannelState) => {
      state.curValue = this._resources.getTagValue(state.config.internalTag)
      // Return the filtering result:
      return opts.sendAll || !isEqual(state.curValue, state.sentValue)
    })
  }

  start() {
    this._updateMQTTChannels()
    this._updateMetadataToMQTT()
    this._protocolHandler.start()
    this._stopRxMonitor()
    const {channelsFromMQTT} = this._config
    if (channelsFromMQTT && channelsFromMQTT.length) {
      const timeoutCheckIntervalTime = (this._dataFromMQTTTimeout > 5000) ? 1000 : 100
      this._rxMonitorInterval = setInterval(this._checkRxTimeouts, timeoutCheckIntervalTime)
    }
  }

  _stopRxMonitor() {
    if (this._rxMonitorInterval) {
      clearInterval(this._rxMonitorInterval)
      this._rxMonitorInterval = undefined
    }
  }

  tagsChanged() {
    this._updateMQTTChannels()
    this._onMetadataChange()
  }

  // TODO: Ensure this is called whenever channelsToMQTT, channelsFromMQTT, or public tags
  // may have changed
  _updateMQTTChannels() {
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
      const publicTagsNotFromThisPlugin = difference(this._resources.publicTags(), internalTagsFromThisPlugin)
      const unPublishedPublicTags = difference(publicTagsNotFromThisPlugin, alreadyPublishedSystemTags)
      // Don't publish tags where the MQTT tag path is already being published to
      const extraTagsToPublish = difference(unPublishedPublicTags, alreadyPublishedMQTTTags)
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

    const prevChannelStates = keyBy(this._toMQTTChannelStates, (state: ToMQTTChannelState) => state.config.mqttTag)
    this._toMQTTChannelStates = this._toMQTTEnabledChannelConfigs.map((config: MQTTChannelConfig) => ({
      curValue: undefined,
      sentValue: undefined,
      // Override curValue and sentValue with previous state, if any
      ...(prevChannelStates[config.mqttTag] || {}), // Start with the old state, if any
      // Force config to new config
      config
    }))

    this._channelsFromMQTTConfigs = {}
    for (let channelConfig: MQTTChannelConfig of (this._config.channelsFromMQTT || [])) {
      const {id, enabled, internalTag, mqttTag, multiplier, offset, metadataItem} = channelConfig
      if (enabled && internalTag && mqttTag) {
        const dataType = (metadataItem && metadataItem.dataType === 'string') ? 'string' : 'number'
        this._channelsFromMQTTConfigs[channelConfig.mqttTag] = {
          id,
          internalTag,
          dataType,
          multiplier,
          offset
        }
      }
    }
  }

  destroy() {
    this._resources.metadataHandler.removeListener(EVENT_METADATA_CHANGE, this._onMetadataChange)
    if (this._publishDataTimeout) {
      clearTimeout(this._publishDataTimeout)
      this._publishDataTimeout = undefined
    }
    this._protocolHandler.destroy()
  }

  _onMetadataChange = () => {
    if (this._updateMetadataToMQTT())
      this._publishAll()
  }

  _publishAll() {
    this._protocolHandler.publishAll({
      metadata: this._metadataToMQTT,
      data: this._generateDataMessage(this._getChannelsToSend({sendAll: true})),
      time: Date.now()
    })
  }

  /**
   * Generates a data update to MQTT. Also emits updates to the internal "MQTT value" tags.
   * @param channelsToSend
   * @returns {Array<DataValueToMQTT>} Array of items to send to the protocol
   * @private
   */
  _generateDataMessage(channelsToSend: Array<ToMQTTChannelState>): Array<DataValueToMQTT> {
    const valuesToMQTT: Array<DataValueToMQTT> = []
    const internalTagValues = {}
    for (let channelToSend: ToMQTTChannelState of channelsToSend) {
      channelToSend.sentValue = channelToSend.curValue
      const {mqttTag} = channelToSend.config
      const value = channelToSend.curValue
      valuesToMQTT.push({
        tag: mqttTag,
        value,
        metadata: this._metadataToMQTTByMQTTTag.get(mqttTag)
      })
      internalTagValues[MQTTTags.toMQTTValue(this._id, mqttTag)] = value
    }
    if (Object.keys(internalTagValues).length) {
      this.emit(DATA_PLUGIN_EVENT_DATA, internalTagValues)
    }
    return valuesToMQTT
  }

  /**
   * Updates _metadataToMQTT and _metadataToMQTTByMQTTTag
   * @returns true if the metadata has changed, false otherwise
   * @private
   */
  _updateMetadataToMQTT(): Array<MetadataValueToMQTT> {
    const metadataToMQTT: Array<MetadataValueToMQTT> = []
    const metadataToMQTTByMQTTTag: Map<string, MetadataItem> = new Map()
    this._toMQTTEnabledChannelConfigs.forEach((channel: MQTTChannelConfig) => {
      const {mqttTag, internalTag} = channel
      const metadataForTag: ?MetadataItem = this._resources.metadataHandler.getTagMetadata(internalTag)
      if (metadataForTag && !metadataToMQTTByMQTTTag.has(mqttTag)) {
        metadataToMQTT.push({
          tag: mqttTag,
          metadata: metadataForTag
        })
        metadataToMQTTByMQTTTag.set(mqttTag, metadataForTag)
      }
    })
    const changed = !isEqual(metadataToMQTT, this._metadataToMQTT)
    this._metadataToMQTT = metadataToMQTT
    this._metadataToMQTTByMQTTTag = metadataToMQTTByMQTTTag
    return changed
  }

  _setValuesFromMQTT(valuesByMQTTTag: ValuesFromMQTTMap) {
    const now = Date.now()
    const valuesBySystemTag: ValuesMap = {}
    for (let mqttTag in valuesByMQTTTag) {
      const value = valuesByMQTTTag[mqttTag]
      const channelConfig: ?ChannelFromMQTTConfig = this._channelsFromMQTTConfigs[mqttTag]
      if (channelConfig) {
        const {internalTag} = channelConfig

        const acceptValue = (value: any) => {
          valuesBySystemTag[internalTag] = value
          valuesBySystemTag[MQTTTags.fromMQTTValue(this._id, mqttTag)] = value
          this._dataFromMQTTRxTimes.set(internalTag, now)
          this._dataFromMQTTRxTimes.set(MQTTTags.fromMQTTValue(this._id, mqttTag), now)
        }

        if ('string' === channelConfig.dataType) {
          if (value == null || typeof value === 'string') {
            acceptValue(value)
          } else if (!this._channelsFromMQTTWarningsPrinted.has(internalTag)) {
            log.error(`type mismatch for ${internalTag}: expected string, was ${typeof value}`)
            this._channelsFromMQTTWarningsPrinted.add(internalTag)
          }
        } else { // number
          if (value == null || typeof value === 'number') {
            let valueWithSlopeOffset = value
            const {multiplier, offset} = channelConfig
            if (multiplier != null)
              valueWithSlopeOffset *= multiplier
            if (offset != null)
              valueWithSlopeOffset += offset
            acceptValue(valueWithSlopeOffset)
          } else if (!this._channelsFromMQTTWarningsPrinted.has(internalTag)) {
            log.error(`type mismatch for ${internalTag}: expected number, was ${typeof value}`)
            this._channelsFromMQTTWarningsPrinted.add(internalTag)
          }
        }
      }
    }

    if (Object.keys(valuesBySystemTag).length) {
      log.info(`Publishing data from MQTT: ${JSON.stringify(valuesBySystemTag)}`)
      this.emit(DATA_PLUGIN_EVENT_DATA, valuesBySystemTag)
    }
  }

  _checkRxTimeouts = () => {
    const timedOutValues: ValuesMap = {}
    const minRxTime = Date.now() - this._dataFromMQTTTimeout
    this._dataFromMQTTRxTimes.forEach((rxTime: number, tag: string) => {
      if (rxTime < minRxTime) {
        timedOutValues[tag] = null
        this._dataFromMQTTRxTimes.delete(tag)
      }
    })

    if (Object.keys(timedOutValues).length) {
      log.info(`Publishing timeouts for tags: ${Object.keys(timedOutValues).join(', ')}`)
      this.emit(DATA_PLUGIN_EVENT_DATA, timedOutValues)
    }
  }
}
