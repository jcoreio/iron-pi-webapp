/* @flow */

export const CM_NUM_IO = 8
export const EXPANSION_BOARD_NUM_IO = 16

export type SPIDeviceInfo = {
  deviceId: number,
  numDigitalInputs: number,
  numDigitalOutputs: number,
  numAnalogInputs: number,
  hasConnectButton?: boolean,
}

export const SPIDevices: Array<SPIDeviceInfo> = [
  { // MCU on the Iron Pi CM8
    deviceId: 1,
    numDigitalInputs: 8,
    numDigitalOutputs: 8,
    numAnalogInputs: 4,
    hasConnectButton: true,
  }/*,
  { // MCU on optional IO16 expansion
    deviceId: 2,
    numDigitalInputs: 16,
    numDigitalOutputs: 16,
    numAnalogInputs: 8
  }*/
]
