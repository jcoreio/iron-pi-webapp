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

export const SPIDeviceTypesDef: {[model: string]: SPIDeviceModelInfo} = {
  'iron-pi-cm8': {
    numDigitalInputs: 8,
    numDigitalOutputs: 8,
    numAnalogInputs: 4,
    hasConnectButton: true,
  },
  'iron-pi-io16': {
    numDigitalInputs: 16,
    numDigitalOutputs: 16,
    numAnalogInputs: 8,
  },
}
