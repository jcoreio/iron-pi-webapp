/* @flow */

import EventEmitter from '@jcoreio/typed-event-emitter'
import logger from 'log4jcore'

import { CHANNEL_DEVICE_STATUS, CHANNEL_DIGITAL_OUTPUT_STATUS, DIGITAL_OUTPUTS_TIMEOUT,
  MESSAGE_DIGITAL_OUTPUT_STATUS_DE_DUPE_ID } from './SPIConstants'
import { SPIDevices } from './SPIDevicesInfo'

import type { SPIDeviceInfo } from './SPIDevicesInfo'

const log = logger('SPIHandler')

const MSG_ID_STATUS = 1

const STATUS_MSG_LEN = 20

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

type SPIHubEvents = {
  message: [MessageFromSPI],
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

  constructor(spiHubClient: SPIHubClient) {
    super()
    this._spi = spiHubClient
    this._spi.on('message', msgObj => this._onSPIMessage(msgObj))
    this._spi.on('error', (err: Error) => {
      if (!this._spiErrorLogged) {
        log.error(`SPI error: ${err.stack || (err: any)}`)
        this._spiErrorLogged = true
      }
    })
  }

  start() {
    this._running = true
  }

  stop() {
    this._running = false
  }

  sendDigitalOutputs(values: ?Array<boolean>) {
    let outputIdx = 0
    SPIDevices.forEach((device: SPIDeviceInfo) => {
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
    })
  }

  _onSPIMessage(msgObj: Object) {
    if (!this._running) return
    ++this._messageCount
    try {
      if (CHANNEL_DEVICE_STATUS !== msgObj.channel) {
        throw new Error('unexpected SPI channel')
      }
      const deviceInfo: ?SPIDeviceInfo = SPIDevices.find(spiDevice => spiDevice.deviceId === msgObj.device)
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
      console.error('error handling SPI message', err.stack, msgObj) // eslint-disable-line no-console
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

    const analogInputLevels: Array<number> = []
    for (let analogInputIdx = 0; analogInputIdx < deviceInfo.numAnalogInputs; ++analogInputIdx) {
      analogInputLevels[analogInputIdx] = msg.readUInt16LE(pos)
      pos += 2
    }

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
