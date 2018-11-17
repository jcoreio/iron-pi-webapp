/* @flow */

import type IronPiDeviceClient, {DetectedDevice, HardwareInfo, LEDCommand} from '@jcoreio/iron-pi-device-client'

export const LED_MESSAGE_CONNECT_MODE = 'gggg'
export const LED_MESSAGE_STATIC_MODE = 'ggggg'
export const LED_MESSAGE_DHCP_MODE = 'gggggg'

export default class LEDHandler {
  _ironPiDeviceClient: IronPiDeviceClient

  constructor({ironPiDeviceClient}: {ironPiDeviceClient: IronPiDeviceClient}) {
    this._ironPiDeviceClient = ironPiDeviceClient
  }

  sendLEDMessage(colors: string) {
    const hardwareInfo: ?HardwareInfo = this._ironPiDeviceClient.hardwareInfo()
    if (hardwareInfo) {
      const leds: Array<LEDCommand> = hardwareInfo.devices.map((device: DetectedDevice) => ({
        address: device.address,
        colors,
        onTime: 400,
        offTime: 400,
        idleTime: 3000,
      }))
      this._ironPiDeviceClient.setLEDs({leds})
    }
  }
}
