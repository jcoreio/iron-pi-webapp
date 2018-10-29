/* @flow */

export type SPIDeviceModelInfo = {
  numDigitalInputs: number,
  numDigitalOutputs: number,
  numAnalogInputs: number,
  hasConnectButton?: boolean,
}

export type SPIDeviceInfo = SPIDeviceModelInfo & {
  deviceId: number,
}

export const MODEL_IRON_PI_CM8 = 'iron-pi-cm8'
export const MODEL_IRON_PI_IO16 = 'iron-pi-io16'

export const SPIDeviceTypesDef: {[model: string]: SPIDeviceModelInfo} = {
  [MODEL_IRON_PI_CM8]: {
    numDigitalInputs: 8,
    numDigitalOutputs: 8,
    numAnalogInputs: 4,
    hasConnectButton: true,
  },
  [MODEL_IRON_PI_IO16]: {
    numDigitalInputs: 16,
    numDigitalOutputs: 16,
    numAnalogInputs: 8,
  },
}
