// @flow

import EventEmitter from '@jcoreio/typed-event-emitter'
import mqtt from 'mqtt'
import logger from 'log4jcore'

import {EVENT_DATA_FROM_MQTT, EVENT_MQTT_CONNECT, EVENT_MQTT_DISCONNECT} from './MQTTProtocolHandler'
import type {MQTTProtocolHandlerEmittedEvents} from './MQTTProtocolHandler'

import type {DataValueToMQTT, MetadataValueToMQTT, ValuesFromMQTTMap} from '../MQTTTypes'

const log = logger('MQTTJSONHandler')

export type JSONHandlerConfig = {
  serverURL: string,
  username: string,
  password: string,
  clientId: string,
  dataToMQTTTopic: string,
  metadataToMQTTTopic: string,
  dataFromMQTTTopic: string,
}

export default class MQTTJSONHandler extends EventEmitter<MQTTProtocolHandlerEmittedEvents> {
  _config: JSONHandlerConfig
  _client: ?Object // MQTT client

  _connected: boolean = false
  _destroyed: boolean = false

  _createNewClientTimeout: ?number

  constructor(args: {config: JSONHandlerConfig}) {
    super()
    this._config = args.config
    this._setupClient()
  }

  destroy() {
    this._destroyed = true
    if (this._client)
      this._client.end()
    const createNewClientTimeout = this._createNewClientTimeout
    this._createNewClientTimeout = undefined
    if (createNewClientTimeout)
      clearTimeout(createNewClientTimeout)
  }

  _setupClient() {
    if (this._client)
      this._client.end()
    const {serverURL, username, password, clientId, dataFromMQTTTopic} = this._config
    const client = this._client = mqtt.connect(serverURL, {
      clientId,
      keepalive: 30,
      resubscribe: false,
      username,
      password
    })

    client.on('connect', () => {
      this._connected = true
      this.emit(EVENT_MQTT_CONNECT)
      if (dataFromMQTTTopic)
        client.subscribe(dataFromMQTTTopic, {qos: 0})
    })
    client.on('error', (err: Error) => {
      log.error(`mqtt client error: ${err.stack}`)
      client.end()
      if (!this._destroyed && !this._createNewClientTimeout) {
        this._createNewClientTimeout = setTimeout(() => {
          this._createNewClientTimeout = undefined
          this._setupClient()
        }, 5000)
      }
    })
    client.on('close', () => {
      const wasConnected = this._connected
      this._connected = false
      if (wasConnected)
        this.emit(EVENT_MQTT_DISCONNECT)
    })
    client.on('message', (topic: string, message: Buffer) => this._handleDataFromMQTT(topic, message))
  }

  publishData(args: {data: Array<DataValueToMQTT>, time: number}) {
    const {data, time} = args

    const dataToSend = {}
    for (let dataValue: DataValueToMQTT of data) {
      dataToSend[dataValue.tag] = dataValue.value
    }

    const {dataToMQTTTopic} = this._config
    if (this._client && dataToMQTTTopic)
      this._client.publish(dataToMQTTTopic, JSON.stringify({timestamp: time, data: dataToSend}))
  }

  publishAll(args: {metadata: Array<MetadataValueToMQTT>, data: Array<DataValueToMQTT>, time: number}) {
    // Wait for the SparkPlug client to request the birth certificate
    if (!this._connected) return
    const {metadata, data, time} = args
    const metadataToSend = {}
    for (let metadataValue: MetadataValueToMQTT of metadata) {
      const {name, dataType, units, min, max, rounding, displayPrecision} = metadataValue.metadata
      metadataToSend[metadataValue.tag] = {name, dataType, units, min, max, rounding, displayPrecision}
    }

    const {metadataToMQTTTopic} = this._config
    if (this._client && metadataToMQTTTopic)
      this._client.publish(metadataToMQTTTopic, JSON.stringify({timestamp: time, metadata: metadataToSend}))
    this.publishData({data, time})
  }

  _handleDataFromMQTT(topic: string, message: Buffer) {
    log.info(`message from MQTT: topic: ${topic}, message ${message.toString('utf8')}`)
    const valuesFromMQTT: ValuesFromMQTTMap = {}
    // for (let metric: SparkPlugDataMertic of message.metrics) {
    //   valuesFromMQTT[metric.name] = metric.value
    // }
    this.emit(EVENT_DATA_FROM_MQTT, valuesFromMQTT)
  }
}
