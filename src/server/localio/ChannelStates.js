// @flow

import {Map} from 'immutable'
import pubsub from '../graphql/pubsub'
import type {
  AnalogInputState, Calibration, CalibrationPoint, ChannelState, SetChannelState,
  SetChannelValue
} from '../../universal/types/Channel'
import {
  SetAnalogInputValueType, SetChannelStateType, SetDigitalInputValueType,
  SetDigitalOutputValueType
} from '../../universal/types/Channel'
import memoize from 'lodash.memoize'
import omit from 'lodash.omit'
import {createSelector} from 'reselect'
import Calibrator from './Calibrator'

type ChannelStates = Map<number, ChannelState>

let channelStates: ChannelStates = Map()

export function getChannelStates(): ChannelStates {
  return channelStates
}

export function getChannelState(id: number): ?ChannelState {
  return channelStates.get(id)
}

function isChanged(current: ?Object, next: Object): boolean {
  if (!current) return true
  for (let key in next) {
    if (current[key] !== next[key]) return true
  }
  return false
}

const selectCalibrator: (state: ChannelState) => Calibrator = createSelector(
  state => state.calibration,
  createSelector(
    state => state.id,
    memoize((channelId: number) => createSelector(
      (calibration: Calibration) => calibration.points,
      (points: Array<CalibrationPoint> = []) => new Calibrator(points)
    ))
  ),
  (calibration: Calibration = {points: []}, selectCalibrator) => selectCalibrator(calibration)
)

function calculateDerivedValue(state: ChannelState) {
  switch (state.mode) {
  case 'ANALOG_INPUT': {
    const {rawInput} = state
    if (rawInput == null) state.systemValue = null
    else (state: AnalogInputState).systemValue = selectCalibrator(state).calibrate(rawInput)
    break
  }
  case 'DIGITAL_INPUT': {
    if (state.rawInput == null) state.systemValue = null
    else {
      if (state.reversePolarity) state.systemValue = state.rawInput ? 0 : 1
      else state.systemValue = state.rawInput
    }
    break
  }
  case 'DIGITAL_OUTPUT': {
    const rawValue = state.controlValue != null ? state.controlValue : state.safeState
    if (state.reversePolarity) state.rawOutput = rawValue ? 0 : 1
    else state.rawOutput = rawValue
    break
  }
  }
}

function publish(state: ChannelState) {
  const publishedValue = omit(state, 'calibration')
  pubsub.publish('ChannelStates', {ChannelStates: publishedValue})
  pubsub.publish(`ChannelStates/${publishedValue.id}`, {ChannelState: publishedValue})
}

export function setChannelStates(...newStates: Array<SetChannelState>) {
  const changes: Array<ChannelState> = []

  channelStates = channelStates.withMutations(
    (currentStates: ChannelStates) => newStates.forEach((entry: SetChannelState) => {
      const newState = {...entry}
      SetChannelStateType.assert(newState)
      const current = currentStates.get(newState.id)
      if (!isChanged(current, newState)) {
        return
      }
      if (current != null && current.mode === newState.mode) {
        switch (current.mode) {
        case 'ANALOG_INPUT':
        case 'DIGITAL_INPUT':
          if (!newState.hasOwnProperty('rawInput')) (newState: Object).rawInput = current.rawInput
          break
        case 'DIGITAL_OUTPUT':
          if (!newState.hasOwnProperty('controlValue')) (newState: Object).controlValue = current.controlValue
          break
        }
      } else {
        switch (newState.mode) {
        case 'ANALOG_INPUT':
        case 'DIGITAL_INPUT':
          if (!newState.hasOwnProperty('rawInput')) (newState: Object).rawInput = null
          break
        case 'DIGITAL_OUTPUT':
          if (!newState.hasOwnProperty('controlValue')) (newState: Object).controlValue = null
          break
        }
      }
      calculateDerivedValue((newState: Object))
      changes.push((newState: Object))
      currentStates.set(newState.id, newState)
    })
  )
  changes.forEach(state => publish(state))
}

export function setChannelValues(...newValues: Array<SetChannelValue>): Array<ChannelState> {
  const changes: Array<ChannelState> = []

  channelStates = channelStates.withMutations(
    (currentStates: ChannelStates) => newValues.forEach((newValue: SetChannelValue) => {
      const current = currentStates.get(newValue.id)
      if (!current) throw new Error(`Missing state for channel ${newValue.id}`)
      switch (current.mode) {
      case 'ANALOG_INPUT':
        SetAnalogInputValueType.assert(newValue)
        break
      case 'DIGITAL_INPUT':
        SetDigitalInputValueType.assert(newValue)
        break
      case 'DIGITAL_OUTPUT': {
        const {controlMode} = current
        if (controlMode !== 'REMOTE_CONTROL') {
          throw new Error("Can't set value unless channel is remote controlled")
        }
        SetDigitalOutputValueType.assert(newValue)
        break
      }
      case 'DISABLED':
        throw new Error(`Can't set the value on channel ${newValue.id}, it's disabled`)
      }
      if (!isChanged(current, newValue)) {
        return
      }
      const newState: ChannelState = {...current, ...newValue}
      calculateDerivedValue(newState)
      changes.push(newState)
      currentStates.set(newState.id, newState)
    })
  )

  changes.forEach(state => publish(state))

  return changes
}

