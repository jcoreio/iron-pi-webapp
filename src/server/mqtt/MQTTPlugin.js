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
import {DATA_TYPE_STRING, DATA_TYPE_NUMBER} from '../../universal/types/MetadataItem'
import type {MetadataItem} from '../../universal/types/MetadataItem'
import {cleanMQTTConfig, mqttConfigToDataPluginMappings, MQTT_PROTOCOL_SPARKPLUG, MQTT_PROTOCOL_TEXT_JSON} from '../../universal/mqtt/MQTTConfig'
import type {MQTTChannelConfig, MQTTConfig} from '../../universal/mqtt/MQTTConfig'
import {DATA_PLUGIN_EVENT_DATA} from '../data-router/PluginTypes'
import type { DataPlugin, DataPluginEmittedEvents, CycleDoneEvent,
  DataPluginMapping, ValuesMap} from '../data-router/PluginTypes'
import {EVENT_METADATA_CHANGE} from '../metadata/MetadataHandler'
import type MetadataHandler from '../metadata/MetadataHandler'
import type {ValuesFromMQTTMap, DataValueToMQTT, ChannelFromMQTTConfig, MetadataValueToMQTT} from './MQTTTypes'
import * as tags from '../../universal/mqtt/MQTTTags'
import {ProtocolRequiredFieldsType} from '../../universal/mqtt/MQTTConfig'
import type {MQTTPluginState} from '../../universal/types/MQTTPluginState'
import {
  MQTT_PLUGIN_STATUS_CONNECTED,
  MQTT_PLUGIN_STATUS_CONNECTING,
  MQTT_PLUGIN_STATUS_ERROR
} from '../../universal/types/MQTTPluginState'

const log = logger('MQTTPlugin')

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
  _pluginInfo: PluginInfo;
  _resources: MQTTPluginResources;

  _protocolHandler: MQTTProtocolHandler;

  _metadataListener = () => this._metadataChanged();

  _metadataToMQTT: Array<MetadataValueToMQTT> = []

  _channelsFromMQTTConfigs: ChannelsFromMQTTConfigMap = {}
  _tagsPublishedFromMQTT: Set<string> = new Set()

  _channelsFromMQTTWarningsPrinted: Set<string> = new Set()

  /** Configs for enabled channels to MQTT, combined with channels that are being sent
   * because "publish all" is enabled */
  _toMQTTEnabledChannelConfigs: Array<MQTTChannelConfig> = [];
  /** Stored state on the value and TX time sent for each MQTT tag */
  _toMQTTChannelStates: Array<ToMQTTChannelState> = []
  _lastTxTime: number = 0;
  _publishDataTimeout: ?number;

  _state: MQTTPluginState

  constructor(args: {config: MQTTConfig, resources: MQTTPluginResources}) {
    super()
    this._config = cleanMQTTConfig(args.config)
    ProtocolRequiredFieldsType.assert(this._config)
    this._pluginInfo = {
      pluginType: 'mqtt',
      pluginId: args.config.id,
      pluginName: args.config.name || `MQTT Plugin ${args.config.id}`
    }
    this._state = {
      id: args.config.id,
      status: MQTT_PLUGIN_STATUS_CONNECTING,
    }
    this._resources = args.resources

    const {protocol} = this._config
    switch (protocol) {
    case MQTT_PROTOCOL_SPARKPLUG: {
      const {serverURL, username, password, groupId, nodeId} = (this._config: any)
      this._protocolHandler = new SparkPlugHandler({config: {serverURL, username, password, groupId, nodeId}})
      break
    }
    case MQTT_PROTOCOL_TEXT_JSON: {
      const {serverURL, username, password, clientId, dataToMQTTTopic, metadataToMQTTTopic, dataFromMQTTTopic} = (this._config: any)
      this._protocolHandler = new MQTTJSONHandler({config: {serverURL, username, password, clientId, dataToMQTTTopic, metadataToMQTTTopic, dataFromMQTTTopic}})
      break
    }
    default: throw new Error(`unrecognized MQTT protocol: was ${protocol}, expected '${MQTT_PROTOCOL_SPARKPLUG}' or '${MQTT_PROTOCOL_TEXT_JSON}'`)
    }
    this._protocolHandler.on(EVENT_DATA_FROM_MQTT, (data: ValuesFromMQTTMap) => this._setValuesFromMQTT(data))
    this._protocolHandler.on(EVENT_MQTT_CONNECT, this._handleConnect)
    this._protocolHandler.on(EVENT_MQTT_DISCONNECT, this._handleDisconnect)
    this._protocolHandler.on(EVENT_MQTT_ERROR, this._handleError)
    this._resources.metadataHandler.on(EVENT_METADATA_CHANGE, this._metadataListener)
  }

  getState(): MQTTPluginState {
    return this._state
  }

  _setState = (newState: MQTTPluginState) => {
    this._state = newState
    this.emit(MQTT_PLUGIN_EVENT_STATE_CHANGE, this._state)
  }

  _handleConnect = () => {
    this._setState({
      id: this._config.id,
      status: MQTT_PLUGIN_STATUS_CONNECTED,
      connectedSince: Date.now().toString(),
    })
    this._publishAll()
  }

  _handleDisconnect = () => {
    this._setState({
      id: this._config.id,
      status: MQTT_PLUGIN_STATUS_ERROR,
    })
    const valuesToPublish: ValuesFromMQTTMap = {}
    this._tagsPublishedFromMQTT.forEach(tag => valuesToPublish[tag] = null)
    this._tagsPublishedFromMQTT.clear()
    if (Object.keys(valuesToPublish).length)
      this.emit(DATA_PLUGIN_EVENT_DATA, valuesToPublish)
  }

  _handleError = (err: Error) => {
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
    const changedValues: ValuesMap = {}
    for (let state: ToMQTTChannelState of channelsToSend) {
      changedValues[tags.mqttValue(state.config.mqttTag)] = state.curValue
    }
    const data: Array<DataValueToMQTT> = this._generateDataMessage(channelsToSend)
    this._protocolHandler.publishData({data, time})
    this._lastTxTime = args.time

    if (Object.keys(changedValues).length) {
      log.info(`Publishing data to MQTT: ${JSON.stringify(changedValues)}`)
      this.emit(DATA_PLUGIN_EVENT_DATA, changedValues)
    }
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
    this._metadataToMQTT = this._calcMetadataToMQTT()
  }

  tagsChanged() {
    this._updateMQTTChannels()
    this._metadataChanged()
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
    this._resources.metadataHandler.removeListener(EVENT_METADATA_CHANGE, this._metadataListener)
    if (this._publishDataTimeout) {
      clearTimeout(this._publishDataTimeout)
      this._publishDataTimeout = undefined
    }
    this._protocolHandler.destroy()
  }

  _metadataChanged() {
    const metadataToMQTT = this._calcMetadataToMQTT()
    if (!isEqual(metadataToMQTT, this._metadataToMQTT)) {
      this._metadataToMQTT = metadataToMQTT
      this._publishAll()
    }
  }

  _publishAll() {
    this._protocolHandler.publishAll({
      metadata: this._metadataToMQTT,
      data: this._generateDataMessage(this._toMQTTChannelStates),
      time: Date.now()
    })
  }

  _generateDataMessage(channelsToSend: Array<ToMQTTChannelState>): Array<DataValueToMQTT> {
    const values: Array<DataValueToMQTT> = []
    for (let channelToSend: ToMQTTChannelState of channelsToSend) {
      channelToSend.sentValue = channelToSend.curValue
      const metadata: ?MetadataItem = channelToSend.config.metadataItem
      values.push({
        tag: channelToSend.config.mqttTag,
        value: channelToSend.curValue,
        type: metadata && DATA_TYPE_STRING === metadata.dataType ? DATA_TYPE_STRING : DATA_TYPE_NUMBER
      })
    }
    return values
  }

  _calcMetadataToMQTT(): Array<MetadataValueToMQTT> {
    const metadataToMQTT: Array<MetadataValueToMQTT> = []
    const publishedMQTTTags: Set<string> = new Set()
    this._toMQTTEnabledChannelConfigs.forEach((channel: MQTTChannelConfig) => {
      const metadataForTag: ?MetadataItem = this._resources.metadataHandler.getTagMetadata(channel.internalTag)
      if (metadataForTag && !publishedMQTTTags.has(channel.mqttTag)) {
        metadataToMQTT.push({
          tag: channel.mqttTag,
          metadata: metadataForTag
        })
        publishedMQTTTags.add(channel.mqttTag)
      }
    })
    return metadataToMQTT
  }

  _setValuesFromMQTT(valuesByMQTTTag: ValuesFromMQTTMap) {
    const valuesBySystemTag: ValuesMap = {}
    for (let mqttTag in valuesByMQTTTag) {
      const value = valuesByMQTTTag[mqttTag]
      const channelConfig: ?ChannelFromMQTTConfig = this._channelsFromMQTTConfigs[mqttTag]
      if (channelConfig) {
        const {internalTag} = channelConfig
        if ('string' === channelConfig.dataType) {
          if (value == null || typeof value === 'string') {
            valuesBySystemTag[internalTag] = value
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
            valuesBySystemTag[internalTag] = valueWithSlopeOffset
          } else if (!this._channelsFromMQTTWarningsPrinted.has(internalTag)) {
            log.error(`type mismatch for ${internalTag}: expected number, was ${typeof value}`)
            this._channelsFromMQTTWarningsPrinted.add(internalTag)
          }
        }
      }
    }

    // Track which tags we're publishing, so that we can mark them unavailable when there's
    // a disconnect or error
    for (let tag in valuesBySystemTag) {
      this._tagsPublishedFromMQTT.add(tag)
    }

    if (Object.keys(valuesBySystemTag).length) {
      log.info(`Publishing data from MQTT: ${JSON.stringify(valuesBySystemTag)}`)
      this.emit(DATA_PLUGIN_EVENT_DATA, valuesBySystemTag)
    }
  }
}
