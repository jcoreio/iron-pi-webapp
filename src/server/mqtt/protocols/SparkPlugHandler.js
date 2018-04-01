// @flow

import EventEmitter from '@jcoreio/typed-event-emitter'
import logger from 'log4jcore'
import sparkplug from 'sparkplug-client'

import {EVENT_DATA_FROM_MQTT, EVENT_MQTT_CONNECT, EVENT_MQTT_ERROR} from './MQTTProtocolHandler'
import type {MQTTProtocolHandlerEmittedEvents} from './MQTTProtocolHandler'

import type {DataValueToMQTT, MetadataValueToMQTT, ChannelFromMQTTConfig, ValuesFromMQTTMap} from '../MQTTTypes'
import {SPARKPLUG_VERSION_B_1_0} from './SparkPlugTypes'
import type {SparkPlugBirthMetric, SparkPlugClient, SparkPlugDataMertic, SparkPlugDataMessage, SparkPlugPackage,
  SparkplugTypedValue} from './SparkPlugTypes'

import {DATA_TYPE_NUMBER, DATA_TYPE_STRING} from '../../../universal/types/MetadataItem'
import type {NumericMetadataItem, MetadataItem} from '../../../universal/types/MetadataItem'

const log = logger('SparkPlugHandler')

export type SparkPlugHandlerConfig = {
  serverURL: string,
  username: string,
  password: string,
  groupId: string,
  nodeId: string,
}

export default class SparkPlugHandler extends EventEmitter<MQTTProtocolHandlerEmittedEvents> {
  _client: SparkPlugClient
  _getChannelFromMQTTConfig: (tag: string) => ?ChannelFromMQTTConfig
  _sparkplugBirthRequested: boolean = false

  _channelsFromMQTTWarningsPrinted: Set<string> = new Set()

  constructor(args: {config: SparkPlugHandlerConfig, getChannelFromMQTTConfig: (tag: string) => ?ChannelFromMQTTConfig}) {
    super()
    const {config, getChannelFromMQTTConfig} = args
    this._getChannelFromMQTTConfig = getChannelFromMQTTConfig
    const {serverURL, username, password, groupId, nodeId} = config
    if (!groupId || !nodeId) throw new Error('missing groupId or nodeId')
    this._client = (sparkplug: SparkPlugPackage).newClient({
      serverUrl: serverURL,
      username: username || null,
      password: password || null,
      groupId,
      edgeNode: nodeId,
      clientId: `jcore-node-${groupId}/${nodeId}`,
      version: SPARKPLUG_VERSION_B_1_0,
    })

    this._client.on('error', (err: Error) => {
      log.error(`SparkPlug client error: ${err.stack}`) // eslint-disable-line no-console
      this.emit(EVENT_MQTT_ERROR, err)
    })
    this._client.on('close', () => {
      log.error(`SparkPlug client closed`) // eslint-disable-line no-console
      this.emit(EVENT_MQTT_ERROR, new Error('connection closed'))
    })
    this._client.on('birth', () => {
      this._sparkplugBirthRequested = true
      this.emit(EVENT_MQTT_CONNECT)
    })
    this._client.on('ncmd', (message: SparkPlugDataMessage) => this._handleDataFromSparkPlug(message))
  }

  destroy() {
    this._client.stop()
  }

  publishData(args: {data: Array<DataValueToMQTT>, time: number}) {
    const {data, time} = args
    this._client.publishNodeData({
      timestamp: time,
      metrics: data.map(toSparkPlugMetric)
    })
  }

  _handleDataFromSparkPlug(message: SparkPlugDataMessage) {
    const metrics: Array<SparkPlugDataMertic> = message.metrics
    const valuesFromMQTT: ValuesFromMQTTMap = {}
    for (let metric: SparkPlugDataMertic of metrics) {
      const {name, value} = metric
      const channelConfig: ?ChannelFromMQTTConfig = this._getChannelFromMQTTConfig(name)
      if (channelConfig) {
        const {internalTag} = channelConfig
        if ('string' === channelConfig.dataType) {
          if (value == null || typeof value === 'string') {
            valuesFromMQTT[internalTag] = value
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
            valuesFromMQTT[internalTag] = valueWithSlopeOffset
          } else if (!this._channelsFromMQTTWarningsPrinted.has(internalTag)) {
            log.error(`type mismatch for ${internalTag}: expected number, was ${typeof value}`)
            this._channelsFromMQTTWarningsPrinted.add(internalTag)
          }
        }
      }
    }
    this.emit(EVENT_DATA_FROM_MQTT, valuesFromMQTT)
  }

  publishMetadata(args: {metadata: Array<MetadataValueToMQTT>, data: Array<DataValueToMQTT>, time: number}) {
    // Wait for the SparkPlug client to request the birth certificate
    if (!this._sparkplugBirthRequested) return

    const {metadata, data, time} = args
    const dataByTag: Map<string, DataValueToMQTT> = new Map()
    data.forEach((value: DataValueToMQTT) => dataByTag.set(value.tag, value))

    const metrics: Array<SparkPlugBirthMetric> = metadata.map((metadataValue: MetadataValueToMQTT) => {
      const dataValue: ?DataValueToMQTT = dataByTag.get(metadataValue.tag)
      const metadata: MetadataItem = metadataValue.metadata
      const {name, dataType} = metadata
      const isDigital = metadata.dataType === DATA_TYPE_NUMBER ? metadata.isDigital : false

      const dataMetric: ?SparkPlugDataMertic = dataValue ? toSparkPlugMetric(dataValue) : undefined

      const metric: SparkPlugBirthMetric = {
        ...(dataMetric || {value: null, type: dataType}),
        name: metadataValue.tag,
        properties: {
          longName: toSparkPlugString(name),
        }
      }
      if (DATA_TYPE_NUMBER === dataType && !isDigital) {
        const {min, max, units}: NumericMetadataItem = (metadata: any)
        metric.properties.min = toSparkPlugNumber(min)
        metric.properties.max = toSparkPlugNumber(max)
        metric.properties.units = toSparkPlugString(units)
      }
      return metric
    })

    this._client.publishNodeBirth({timestamp: time, metrics})
  }
}

function toSparkPlugMetric(value: DataValueToMQTT): SparkPlugDataMertic {
  const typedValue: SparkplugTypedValue = DATA_TYPE_STRING === value.type ?
    toSparkPlugString(value.value) : toSparkPlugNumber(value.value)
  return {
    name: value.tag,
    ...typedValue,
  }
}

function toSparkPlugString(value: any): SparkplugTypedValue {
  return {
    type: 'string',
    value: typeof value === 'string' ? value : (Number.isFinite(value) ? value.toString() : '')
  }
}

function toSparkPlugNumber(value: any): SparkplugTypedValue {
  return {
    type: 'Float',
    value: Number.isFinite(value) ? value : NaN
  }
}

