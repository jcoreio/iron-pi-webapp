// @flow

import t, {reify, validate, makeTypeError} from 'flow-runtime'
import type {Type, Validation} from 'flow-runtime'

import type {ControlLogic, NonEmptyControlLogic} from '../types/ControlLogic'

export const ChannelModes = {
  ANALOG_INPUT: {displayText: 'Analog Input'},
  DIGITAL_INPUT: {displayText: 'Digital Input'},
  DIGITAL_OUTPUT: {displayText: 'Digital Output'},
  DISABLED: {displayText: 'Disabled'},
}

export const ChannelModesArray = Object.keys(ChannelModes)

export type ChannelMode = $Keys<typeof ChannelModes>

export function getChannelModeDisplayText(mode: ChannelMode): string {
  return ChannelModes[mode].displayText
}

export type CalibrationPoint = {
  x: number,
  y: number,
}

export type Calibration = {
  points: Array<CalibrationPoint>,
}

export type AnalogInputConfig = {
  units?: string,
  precision: number,
  min: number,
  max: number,
  calibration?: Calibration,
}
export const AnalogInputConfigType = (reify: Type<AnalogInputConfig>)

export type DigitalInputConfig = {
  reversePolarity: boolean,
}
export const DigitalInputConfigType = (reify: Type<DigitalInputConfig>)

export const ControlModes = {
  FORCE_OFF: {displayText: 'Force Off'},
  FORCE_ON: {displayText: 'Force On'},
  LOCAL_CONTROL: {displayText: 'Local Control'},
  REMOTE_CONTROL: {displayText: 'Remote Control'},
}

export const ControlModesArray = Object.keys(ControlModes)

export type ControlMode = $Keys<typeof ControlModes>

export function getControlModeDisplayText(mode: ControlMode): string {
  return ControlModes[mode].displayText
}

export type DigitalOutputConfig = {
  controlMode: ControlMode,
  controlLogic?: ControlLogic,
  reversePolarity: boolean,
  safeState: 0 | 1,
}
export const DigitalOutputConfigType = (reify: Type<DigitalOutputConfig>)

export type LocalControlDigitalOutputConfig = {
  controlMode: 'LOCAL_CONTROL',
  controlLogic: NonEmptyControlLogic,
  reversePolarity: boolean,
  safeState: 0 | 1,
}
export const LocalControlDigitalOutputConfigType = (reify: Type<LocalControlDigitalOutputConfig>)

export type DisabledConfig = Object
export const DisabledConfigType = (reify: Type<DisabledConfig>)

export const LocalIOChannelConfigTypes: {[mode: ChannelMode]: Type<any>} = {
  ANALOG_INPUT: AnalogInputConfigType,
  DIGITAL_INPUT: DigitalInputConfigType,
  DIGITAL_OUTPUT: DigitalOutputConfigType,
  DISABLED: DisabledConfigType,
}

export type LocalIOChannelConfig = {|
  mode: ChannelMode,
  units?: string,
  precision?: number,
  min?: number,
  max?: number,
  calibration?: Calibration,
  controlMode?: ControlMode,
  controlLogic?: ControlLogic,
  reversePolarity?: boolean,
  safeState?: 0 | 1,
|}

export const LocalIOChannelConfigType = (reify: Type<LocalIOChannelConfig>)

export function validateLocalIOChannelConfig(config: any): ?Validation {
  let validation = validate(LocalIOChannelConfigType, config)
  const {mode} = config
  validation.errors.push(...validate(LocalIOChannelConfigTypes[mode], config).errors)
  if (validation.hasErrors()) return validation
  switch (mode) {
  case 'ANALOG_INPUT': {
    const {min, max} = config
    if (max <= min) validation.errors.push([['max'], 'must be > min', t.number()])
    break
  }
  case 'DIGITAL_OUTPUT': {
    const {controlMode, controlLogic} = config
    if (controlMode === 'LOCAL_CONTROL') {
      validation.errors.push(...validate(LocalControlDigitalOutputConfigType, config).errors)
      for (let i = 0; i < controlLogic.length; i++) {
        const {comparison, threshold} = controlLogic[i]
        if (comparison !== 'UNAVAILABLE' && typeof threshold !== 'number') {
          validation.errors.push([['controlLogic', i, 'threshold'], 'must be a number', t.number()])
        }
      }
    }
    break
  }
  }
  return validation.hasErrors() ? validation : null
}

export function assertChannelConfig(config: any) {
  const validation: ?Validation = validateLocalIOChannelConfig(config)
  if (validation) {
    const error = makeTypeError(validation)
    if (error) throw error
  }
}

export type LocalIOChannel = {
  id: number,
  tag: string,
  config: LocalIOChannelConfig,
}

