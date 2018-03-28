/* @flow */

import { CHANNEL_LED_STATUS, MESSAGE_LED_STATUS_DE_DUPE_ID } from './SPIConstants'
import { SPIDevices } from './SPIDevicesInfo'

import type { SPIDeviceInfo } from './SPIDevicesInfo'

const LED_MSG_LEN = 12

const LED_MSG_TIMEOUT_ALLOWANCE = 3000

export type LEDColorAndCount = {
  color: string,
  count: number,
}

export type LEDMessage = {
  colors: Array<LEDColorAndCount>,
  flashRate: number,
  idleTime: number,
}

export const LED_MESSAGE_OK: LEDMessage = {
  colors: [{color: 'green', count: 2}],
  flashRate: 500,
  idleTime: 2000
}

// "App Offline" LED pattern
export const LED_MESSAGE_APP_OFFLINE: LEDMessage = {
  colors: [{color: 'red', count: 2}],
  flashRate: 500,
  idleTime: 2000
}

export const LED_MESSAGE_CONNECT_MODE: LEDMessage = {
  colors: [{color: 'green', count: 4}],
  flashRate: 500,
  idleTime: 4000
}

export const LED_MESSAGE_STATIC_MODE: LEDMessage = {
  colors: [{color: 'green', count: 5}],
  flashRate: 500,
  idleTime: 4000
}

export const LED_MESSAGE_DHCP_MODE: LEDMessage = {
  colors: [{color: 'green', count: 6}],
  flashRate: 500,
  idleTime: 4000
}

export default class LEDHandler {
  _spi: Object;

  constructor(spiHubClient: Object) {
    this._spi = spiHubClient
  }

  sendLEDState(message: LEDMessage, timeoutMessage: LEDMessage) {
    const buf = Buffer.alloc(LED_MSG_LEN * 2)
    encodeLEDMessage(buf, message, 0)
    encodeLEDMessage(buf, timeoutMessage, LED_MSG_LEN)
    SPIDevices.forEach((device: SPIDeviceInfo) => this._spi.send({
      bus: 0, device: device.deviceId, channel: CHANNEL_LED_STATUS,
      msgDeDupeId: MESSAGE_LED_STATUS_DE_DUPE_ID,
      message: buf
    }))
  }
}

function encodeColorAndCount(buf: Buffer, colorCount: ?LEDColorAndCount, offset: number) {
  buf.writeUInt8(colorCount ? ('red' === colorCount.color ? 2 : 1) : 0, offset)
  buf.writeUInt8(colorCount ? colorCount.count : 0, offset + 1)
}

function encodeLEDMessage(buf: Buffer, message: LEDMessage, offset: number) {
  let pos = offset
  encodeColorAndCount(buf, message.colors[0], pos)
  pos += 2
  encodeColorAndCount(buf, message.colors[1], pos)
  pos += 2
  const flashRate = message.flashRate || 500
  const idleTime = message.idleTime || 3000
  buf.writeUInt16LE(flashRate, pos) // on time
  pos += 2
  buf.writeUInt16LE(flashRate, pos) // off time
  pos += 2
  buf.writeUInt32LE(idleTime + LED_MSG_TIMEOUT_ALLOWANCE, pos)
}
