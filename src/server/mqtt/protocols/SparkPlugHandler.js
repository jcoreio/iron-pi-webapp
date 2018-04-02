// @flow

import EventEmitter from '@jcoreio/typed-event-emitter'
import logger from 'log4jcore'
import sparkplug from 'sparkplug-client'

import {EVENT_DATA_FROM_MQTT, EVENT_MQTT_CONNECT, EVENT_MQTT_DISCONNECT, EVENT_MQTT_ERROR} from './MQTTProtocolHandler'
import type {MQTTProtocolHandlerEmittedEvents} from './MQTTProtocolHandler'

import type {DataValueToMQTT, MetadataValueToMQTT, ValuesFromMQTTMap} from '../MQTTTypes'
import {SPARKPLUG_VERSION_B_1_0} from './SparkPlugTypes'
import type {SparkPlugBirthMetric, SparkPlugClient, SparkPlugDataMertic, SparkPlugDataMessage, SparkPlugPackage,
  SparkplugTypedValue} from './SparkPlugTypes'

import {DATA_TYPE_NUMBER, DATA_TYPE_STRING} from '../../../universal/types/MetadataItem'
import type {NumericMetadataItem, MetadataItem} from '../../../universal/types/MetadataItem'

const log = logger('MQTT:SparkPlugHandler')

export type SparkPlugHandlerConfig = {
  serverURL: string,
  username: string,
  password: string,
  groupId: string,
  nodeId: string,
}

export default class SparkPlugHandler extends EventEmitter<MQTTProtocolHandlerEmittedEvents> {
  _client: SparkPlugClient
  _sparkplugBirthRequested: boolean = false

  constructor(args: {config: SparkPlugHandlerConfig}) {
    super()
    const {serverURL, username, password, groupId, nodeId} = args.config
    if (!groupId || !nodeId) throw new Error('missing groupId or nodeId')
    const client = this._client = (sparkplug: SparkPlugPackage).newClient({
      serverUrl: serverURL,
      username: username || null,
      password: password || null,
      groupId,
      edgeNode: nodeId,
      clientId: `jcore-node-${groupId}/${nodeId}`,
      version: SPARKPLUG_VERSION_B_1_0,
    })

    client.on('error', (err: Error) => {
      log.error(`SparkPlug client error: ${err.stack}`)
      this.emit(EVENT_MQTT_ERROR, err)
    })
    client.on('close', () => {
      log.error(`SparkPlug client closed`)
      this.emit(EVENT_MQTT_DISCONNECT)
    })
    client.on('birth', () => {
      this._sparkplugBirthRequested = true
      this.emit(EVENT_MQTT_CONNECT)
    })
    client.on('ncmd', (message: SparkPlugDataMessage) => this._handleDataFromSparkPlug(message))
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

  publishAll(args: {metadata: Array<MetadataValueToMQTT>, data: Array<DataValueToMQTT>, time: number}) {
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

  _handleDataFromSparkPlug(message: SparkPlugDataMessage) {
    const valuesFromMQTT: ValuesFromMQTTMap = {}
    for (let metric: SparkPlugDataMertic of message.metrics) {
      valuesFromMQTT[metric.name] = metric.value
    }
    this.emit(EVENT_DATA_FROM_MQTT, valuesFromMQTT)
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

