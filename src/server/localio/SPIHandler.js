/* @flow */

import EventEmitter from '@jcoreio/typed-event-emitter'
import SPIHubClient, {SPI_HUB_EVENT_DEVICES_CHANGED, SPI_HUB_EVENT_MESSAGE} from 'spi-hub-client'
import type {MessageFromSPI, SPIDetectedDevice, SPIDevicesChangedEvent} from 'spi-hub-client'
import {range} from 'lodash'
import logger from 'log4jcore'

import { CHANNEL_DEVICE_STATUS, CHANNEL_DIGITAL_OUTPUT_STATUS, DIGITAL_OUTPUTS_TIMEOUT,
  MESSAGE_DIGITAL_OUTPUT_STATUS_DE_DUPE_ID } from './SPIConstants'

import type { SPIDeviceInfo, SPIDeviceModelInfo } from './SPIDevicesInfo'
import {MODEL_IRON_PI_CM8, SPIDeviceTypesDef} from './SPIDevicesInfo'

const log = logger('SPIHandler')

const MSG_ID_STATUS = 1

const COUNTS_TO_VOLTS_SLOPE = 0.0001570585
const COUNTS_TO_VOLTS_OFFSET = -0.124076182

export type DeviceStatus = {
  deviceId: number,
  digitalInputLevels: Array<boolean>,
  digitalInputEventCounts: Array<number>,
  digitalOutputLevels: Array<boolean>,
  analogInputLevels: Array<number>,
  connectButtonLevel?: boolean,
  connectButtonEventCount?: number,
}

export const EVENT_DEVICE_STATUS = 'deviceStatus'

type SPIHandlerEvents = {
  deviceStatus: [DeviceStatus],
}

export default class SPIHandler extends EventEmitter<SPIHandlerEvents> {
  _spi: SPIHubClient;
  _running: boolean = false;
  _messageCount: number = 0;
  _okMessageCount: number = 0;

  _spiErrorLogged: boolean = false;

  _simInterval: ?IntervalID;

  _spiDevices: Array<SPIDeviceInfo> = []

  constructor(spiHubClient: SPIHubClient) {
    super()
    this._spi = spiHubClient
    this._spi.on(SPI_HUB_EVENT_MESSAGE, this._onSPIMessage)
    this._spi.on(SPI_HUB_EVENT_DEVICES_CHANGED, this._onSPIDevicesChanged)
    this._spi.on('error', (err: Error) => {
      if (!this._spiErrorLogged) {
        log.error(`SPI error: ${err.stack || (err: any)}`)
        this._spiErrorLogged = true
      }
    })
    if (process.env.IRON_PI_SIM) {
      this._spiDevices = [{
        ...SPIDeviceTypesDef[MODEL_IRON_PI_CM8],
        deviceId: 1,
      }]
    }
  }

  start() {
    this._running = true
    if (process.env.IRON_PI_SIM && !this._simInterval)
      this._simInterval = setInterval(() => this._sendSimMessage(), 2000)
  }

  stop() {
    this._running = false
    const simInterval = this._simInterval
    this._simInterval = undefined
    if (simInterval)
      clearInterval(simInterval)
  }

  sendDigitalOutputs(values: ?Array<boolean>) {
    let outputIdx = 0
    for (const device: SPIDeviceInfo of this._spiDevices) {
      if (device.numDigitalOutputs) {
        const numOutputBytes = device.numDigitalOutputs / 8
        const timeoutOffset = numOutputBytes * 2
        const msgLen = timeoutOffset + 4
        const msg: Buffer = Buffer.alloc(msgLen)
        let byteIdx = 0
        let bitIdx = 0
        let byteValue = 0
        for (let deviceOutIdx = 0; deviceOutIdx < device.numDigitalOutputs; ++deviceOutIdx, ++outputIdx) {
          byteValue |= (values || [])[outputIdx] ? (1 << bitIdx) : 0
          if (++bitIdx >= 8) {
            msg.writeUInt8(byteValue, byteIdx++)
            bitIdx = 0
            byteValue = 0
          }
        }
        msg.writeUInt32LE(DIGITAL_OUTPUTS_TIMEOUT, timeoutOffset)
        this._spi.send({
          busId: 0,
          deviceId: device.deviceId,
          channel: CHANNEL_DIGITAL_OUTPUT_STATUS,
          deDupeId: MESSAGE_DIGITAL_OUTPUT_STATUS_DE_DUPE_ID,
          message: msg
        })
      }
    }
  }

  spiDevices(): Array<SPIDeviceInfo> {
    return this._spiDevices
  }

  _onSPIDevicesChanged = (event: SPIDevicesChangedEvent) => {
    const {devices} = event
    if (!devices) throw Error('unexpected missing devices in devicesChanged message from spi-hub')

    this._spiDevices = []
    for (const device: SPIDetectedDevice of devices) {
      const {deviceId, deviceInfo: { model }} = device
      const modelInfo: ?SPIDeviceModelInfo = SPIDeviceTypesDef[model]
      if (modelInfo) {
        this._spiDevices.push({...modelInfo, deviceId})
      } else {
        log.error(`could not find definition for SPI device model ${model}`)
      }
    }
  }

  _onSPIMessage = (msgObj: MessageFromSPI) => {
    if (!this._running) return
    ++this._messageCount
    try {
      const {deviceId, channel, messageBuffer} = msgObj
      if (CHANNEL_DEVICE_STATUS !== channel) {
        throw new Error('unexpected SPI channel')
      }
      const deviceInfo: ?SPIDeviceInfo = this._spiDevices.find(spiDevice => spiDevice.deviceId === deviceId)
      if (!deviceInfo)
        throw Error('unexpected SPI device')
      if (!messageBuffer || !messageBuffer.length)
        throw Error('unexpected null SPI message')

      const messageId = messageBuffer.readUInt8(0)
      switch (messageId) {
      case MSG_ID_STATUS:
        this._onStatusMsg(messageBuffer, deviceInfo)
        break
      default:
        throw Error('unrecognized SPI message')
      }

      ++this._okMessageCount
    } catch (err) {
      log.error('error handling SPI message', err, msgObj)
    }
  }

  _deviceErrMsgCount = 0

  _onStatusMsg(msg: Buffer, deviceInfo: SPIDeviceInfo) {
    try {
      let pos = 1 // After the message ID byte
      const digitalInputLevels: Array<boolean> = unpackBits(msg, pos, deviceInfo.numDigitalInputs)
      pos += Math.ceil(deviceInfo.numDigitalInputs / 8)

      const digitalOutputLevels: Array<boolean> = unpackBits(msg, pos, deviceInfo.numDigitalOutputs)
      pos += Math.ceil(deviceInfo.numDigitalOutputs / 8)

      const digitalInputEventCounts: Array<number> = []
      for (let digitalInputIdx = 0; digitalInputIdx < deviceInfo.numDigitalInputs; ++digitalInputIdx) {
        digitalInputEventCounts[digitalInputIdx] = msg.readUInt8(pos++)
      }

      const analogInputCounts: Array<number> = []
      for (let analogInputIdx = 0; analogInputIdx < deviceInfo.numAnalogInputs; ++analogInputIdx) {
        analogInputCounts[analogInputIdx] = msg.readUInt16LE(pos)
        pos += 2
      }
      const analogInputLevels = analogInputCounts.map(counts => Math.max(0, (counts * COUNTS_TO_VOLTS_SLOPE) + COUNTS_TO_VOLTS_OFFSET))

      const deviceStatus: DeviceStatus = {
        deviceId: deviceInfo.deviceId,
        digitalInputLevels,
        digitalInputEventCounts,
        digitalOutputLevels,
        analogInputLevels
      }

      if (deviceInfo.hasConnectButton) {
        const connectButtonState = msg.readUInt8(pos++)
        deviceStatus.connectButtonLevel = !!(connectButtonState & 0x80)
        deviceStatus.connectButtonEventCount = connectButtonState & 0x7F
      }
      this.emit(EVENT_DEVICE_STATUS, deviceStatus)
    } catch (err) {
      if (++this._deviceErrMsgCount < 5) {
        if ('ERR_OUT_OF_RANGE' === err.code)
          log.error(`device status message was truncated, device id ${deviceInfo.deviceId}, message len ${msg.length}`, err)
        else
          log.error('unexpected error while decoding device status message', err)
      }
    }
  }

  _activeChannelIdx: number = -1;

  _sendSimMessage() {
    if (++this._activeChannelIdx >= 8)
      this._activeChannelIdx = 0
    const deviceStatus: DeviceStatus = {
      deviceId: 1,
      digitalInputLevels: range(8).map(idx => idx === this._activeChannelIdx ? 1 : 0),
      digitalInputEventCounts: range(8).map(() => 0),
      digitalOutputLevels: range(8).map(() => 0),
      analogInputLevels: range(4).map(idx => idx === this._activeChannelIdx ? 4.5 : 0)
    }
    this.emit(EVENT_DEVICE_STATUS, deviceStatus)
  }
}

function unpackBits(msg: Buffer, offset: number, count: number): Array<boolean> {
  const end = offset + Math.ceil(count / 8)
  const values = []
  let valueIdx = 0
  for (let byteIdx = offset; byteIdx < end; ++byteIdx) {
    let byteValue = msg.readUInt8(byteIdx)
    for (let bitIdx = 0; bitIdx < 8; ++bitIdx) {
      if (valueIdx < count)
        values[valueIdx++] = !!(byteValue & 0x01)
      byteValue >>= 1
    }
  }
  return values
}
