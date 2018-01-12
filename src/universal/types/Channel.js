// @flow

import t, {reify, validate} from 'flow-runtime'
import type {Type, Validation} from 'flow-runtime'

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

export const channelIdPart = "[a-z_][a-z0-9_]*"
export const channelIdPattern = new RegExp(`^${channelIdPart}(/${channelIdPart})*$`, 'i')

export type AnalogInputState = {|
  id: number,
  mode: 'ANALOG_INPUT',
  rawInput: number | null,
  systemValue: number | null,
|}
export const AnalogInputStateType = (reify: Type<AnalogInputState>)

export type DigitalInputState = {|
  id: number,
  mode: 'DIGITAL_INPUT',
  rawInput: 0 | 1 | null,
  systemValue: 0 | 1 | null,
  reversePolarity: boolean,
|}
export const DigitalInputStateType = (reify: Type<DigitalInputState>)

export type DigitalOutputState = {|
  id: number,
  mode: 'DIGITAL_OUTPUT',
  controlValue: 0 | 1 | null,
  safeState: 0 | 1,
  reversePolarity: boolean,
  rawOutput: 0 | 1,
|}
export const DigitalOutputStateType = (reify: Type<DigitalOutputState>)

export type DisabledState = {|
  id: number,
  mode: 'DISABLED',
|}
export const DisabledStateType = (reify: Type<DisabledState>)

export type ChannelState = AnalogInputState | DigitalInputState | DigitalOutputState | DisabledState
export const ChannelStateType = (reify: Type<ChannelState>)

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

export const LogicOperations = {
  AND: {displayText: 'AND'},
  OR: {displayText: 'OR'},
}

export const LogicOperationsArray = Object.keys(LogicOperations)

export type LogicOperation = $Keys<typeof LogicOperations>

export const Comparisons = {
  GT: {displayText: '>'},
  GTE: {displayText: '>='},
  LT: {displayText: '<'},
  LTE: {displayText: '<='},
  EQ: {displayText: '='},
  NE: {displayText: '!='},
}

export const ComparisonsArray = Object.keys(Comparisons)

export type Comparison = $Keys<typeof Comparisons>

export type ControlCondition = {
  operation?: LogicOperation,
  channelId: number,
  comparison: Comparison,
  threshold: number,
}

export type ControlLogic = Array<ControlCondition>

export const ControlLogicType = (reify: Type<ControlLogic>)
ControlLogicType.addConstraint((logic: any) => {
  for (let i = 1; i < logic.length; i++) {
    if (!logic[i].operation) {
      return 'all conditions except the first must have an operation'
    }
  }
})

export type NonEmptyControlLogic = ControlLogic
export const NonEmptyControlLogicType = (reify: Type<NonEmptyControlLogic>)
NonEmptyControlLogicType.addConstraint((logic: any) => {
  if (!logic.length) {
    return 'must have at least one condition'
  }
})

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

export const ChannelConfigTypes: {[mode: ChannelMode]: Type<any>} = {
  ANALOG_INPUT: AnalogInputConfigType,
  DIGITAL_INPUT: DigitalInputConfigType,
  DIGITAL_OUTPUT: DigitalOutputConfigType,
  DISABLED: DisabledConfigType,
}

export type ChannelConfig = {|
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

export const ChannelConfigType = (reify: Type<ChannelConfig>)

export function validateChannelConfig(config: any): ?Validation {
  let validation = validate(ChannelConfigType, config)
  const {mode} = config
  validation.errors.push(...validate(ChannelConfigTypes[mode], config).errors)
  if (validation.hasErrors()) return validation
  switch (mode) {
  case 'ANALOG_INPUT': {
    const {min, max} = config
    if (max <= min) validation.errors.push([['max'], 'must be > min', t.number()])
    break
  }
  case 'DIGITAL_OUTPUT': {
    const {controlMode} = config
    if (controlMode === 'LOCAL_CONTROL') {
      validation.errors.push(...validate(LocalControlDigitalOutputConfigType, config).errors)
    }
    break
  }
  }
  return validation.hasErrors() ? validation : null
}

export type Channel = {
  id: number,
  name: string,
  channelId: string,
  config: ChannelConfig,
  state?: ChannelState,
}

export type SetAnalogInputState = {|
  id: number,
  mode: 'ANALOG_INPUT',
  rawInput?: number | null,
|}
export const SetAnalogInputStateType = (reify: Type<SetAnalogInputState>)

export type SetDigitalInputState = {|
  id: number,
  mode: 'DIGITAL_INPUT',
  rawInput?: 0 | 1 | null,
  reversePolarity: boolean,
|}
export const SetDigitalInputStateType = (reify: Type<SetDigitalInputState>)

export type SetDigitalOutputState = {|
  id: number,
  mode: 'DIGITAL_OUTPUT',
  controlValue?: 0 | 1 | null,
  safeState: 0 | 1,
  reversePolarity: boolean,
|}
export const SetDigitalOutputStateType = (reify: Type<SetDigitalOutputState>)

export type SetDisabledState = {|
  id: number,
  mode: 'DISABLED',
|}
export const SetDisabledStateType = (reify: Type<SetDisabledState>)

export type SetChannelState =
  SetAnalogInputState |
  SetDigitalInputState |
  SetDigitalOutputState |
  SetDisabledState
export const SetChannelStateType = (reify: Type<SetChannelState>)

export type SetAnalogInputValue = {|
  id: number,
  rawInput: number | null,
|}
export const SetAnalogInputValueType = (reify: Type<SetAnalogInputValue>)

export type SetDigitalInputValue = {|
  id: number,
  rawInput: 0 | 1 | null,
|}
export const SetDigitalInputValueType = (reify: Type<SetDigitalInputValue>)

export type SetDigitalOutputValue = {|
  id: number,
  controlValue: 0 | 1 | null,
|}
export const SetDigitalOutputValueType = (reify: Type<SetDigitalOutputValue>)

export type SetChannelValue = SetAnalogInputValue | SetDigitalInputValue | SetDigitalOutputValue
export const SetChannelValueType = (reify: Type<SetChannelValue>)

