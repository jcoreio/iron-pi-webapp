// @flow

import {reify} from 'flow-runtime'
import type {Type} from 'flow-runtime'

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
export const channelIdPattern = new RegExp(`${channelIdPart}(/${channelIdPart})*`, 'i')

export type ChannelState = {
  id: number,
  value: number,
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
  precision?: number,
  calibration?: Calibration,
}

export type DigitalInputConfig = {
  reversePolarity?: boolean,
}

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

export function getLogicOperationDisplayText(op: LogicOperation): string {
  return LogicOperations[op].displayText
}

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

export function getComparisonDisplayText(comparsion: Comparison): string {
  return Comparisons[comparsion].displayText
}

export type ControlCondition = {
  operation?: LogicOperation,
  channelId: number,
  comparison: Comparison,
  threshold: number,
}

export type ControlLogic = Array<ControlCondition>

export const ControlLogicType = (reify: Type<ControlLogic>)
ControlLogicType.addConstraint((logic: ControlLogic) => {
  if (logic.length === 0) {
    return 'cannot be empty'
  }
  for (let i = 1; i < logic.length; i++) {
    if (!logic[i].operation) {
      return 'all conditions except the first must have an operation'
    }
  }
})

export type DigitalOutputConfig = {
  controlMode?: ControlMode,
  controlLogic?: ControlLogic,
  reversePolarity?: boolean,
  safeStateOutputOn?: boolean,
}

export type ChannelConfig = AnalogInputConfig & DigitalInputConfig & DigitalOutputConfig

export const ChannelConfigType = (reify: Type<ChannelConfig>)

export type Channel = {
  id: number,
  name: string,
  channelId: string,
  mode: ChannelMode,
  config: ChannelConfig,
  state?: ChannelState,
}

