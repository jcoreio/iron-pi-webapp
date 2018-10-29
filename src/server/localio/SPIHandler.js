/* @flow */

import EventEmitter from '@jcoreio/typed-event-emitter'
import range from 'lodash.range'
import logger from 'log4jcore'

import { CHANNEL_DEVICE_STATUS, CHANNEL_DIGITAL_OUTPUT_STATUS, DIGITAL_OUTPUTS_TIMEOUT,
  MESSAGE_DIGITAL_OUTPUT_STATUS_DE_DUPE_ID } from './SPIConstants'

import type { SPIDeviceInfo, SPIDeviceModelInfo } from './SPIDevicesInfo'
import {SPIDeviceTypesDef} from './SPIDevicesInfo'

const log = logger('SPIHandler')

const MSG_ID_STATUS = 1

const STATUS_MSG_LEN = 20

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

type MessageFromSPI = {
  channel: number,
  device: number,
  message: Buffer,
}

type MessageToSPI = string | Buffer | {
  bus?: number,
  channel?: number,
  msgDeDupeId?: number,
  device?: number,
  message: string | Buffer,
}

type SPIDetectedDevice = {
  bus: number,
  device: number,
  info: {
    device: string,
    version: string,
  },
}

type DevicesChangedMessage = {
  devices: Array<SPIDetectedDevice>,
  deviceId: string,
  accessCode: string,
}

type SPIHubEvents = {
  message: [MessageFromSPI],
  devicesChanged: [DevicesChangedMessage],
  error: [Error],
}

type SPIHubClient = EventEmitter<SPIHubEvents> & {
  send(message: MessageToSPI): void;
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
    this._spi.on('message', msgObj => this._onSPIMessage(msgObj))
    this._spi.on('devicesChanged', (msg: DevicesChangedMessage) => this._onSPIDevicesChanged(msg))
    this._spi.on('error', (err: Error) => {
      if (!this._spiErrorLogged) {
        log.error(`SPI error: ${err.stack || (err: any)}`)
        this._spiErrorLogged = true
      }
    })
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
          bus: 0,
          device: device.deviceId,
          channel: CHANNEL_DIGITAL_OUTPUT_STATUS,
          msgDeDupeId: MESSAGE_DIGITAL_OUTPUT_STATUS_DE_DUPE_ID,
          message: msg
        })
      }
    }
  }

  spiDevices(): Array<SPIDeviceInfo> {
    return this._spiDevices
  }

  _onSPIDevicesChanged(msgObj: DevicesChangedMessage) {
    const {devices} = msgObj
    if (!devices) throw Error('unexpected missing devices in devicesChanged message from spi-hub')

    this._spiDevices = []
    for (const device: SPIDetectedDevice of devices) {
      const {device: deviceId, info: { device: modelName }} = device
      const modelInfo: ?SPIDeviceModelInfo = SPIDeviceTypesDef[modelName]
      if (modelInfo) {
        this._spiDevices.push({...modelInfo, deviceId})
      } else {
        log.error(`could not find definition for SPI device model ${modelName}`)
      }
    }
  }

  _onSPIMessage(msgObj: Object) {
    if (!this._running) return
    ++this._messageCount
    try {
      if (CHANNEL_DEVICE_STATUS !== msgObj.channel) {
        throw new Error('unexpected SPI channel')
      }
      const deviceInfo: ?SPIDeviceInfo = this._spiDevices.find(spiDevice => spiDevice.deviceId === msgObj.device)
      if (!deviceInfo) {
        throw new Error('unexpected SPI device')
      }

      const {message} = msgObj
      if (!message || !message.length) {
        throw new Error('unexpected null SPI message')
      }

      const messageId = message.readUInt8(0)
      switch (messageId) {
      case MSG_ID_STATUS:
        this._onStatusMsg(message, deviceInfo)
        break
      default:
        throw new Error('unrecognized SPI message')
      }

      ++this._okMessageCount
    } catch (err) {
      log.error('error handling SPI message', err.stack, msgObj)
    }
  }

  _onStatusMsg(msg: Buffer, deviceInfo: SPIDeviceInfo) {
    // 0 = Status
    // 1 = Digital inputs
    // 2 = Digital outputs
    // 3-10: Digital input event counts
    // 11-26: Analog input readings
    // 27: Connect button state
    // 28 = length

    if (STATUS_MSG_LEN !== msg.length) throw new Error('unexpected length for status message')

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
