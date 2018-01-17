// @flow

import {Map} from 'immutable'
import pubsub from '../graphql/pubsub'
import type {AnalogInputState, ChannelState, SetChannelState, SetChannelValue} from '../../universal/types/Channel'
import {
  SetAnalogInputValueType, SetChannelStateType, SetDigitalInputValueType,
  SetDigitalOutputValueType
} from '../../universal/types/Channel'

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

function calculateDerivedValue(state: ChannelState) {
  switch (state.mode) {
  case 'ANALOG_INPUT':
    (state: AnalogInputState).systemValue = state.rawInput
    break
  case 'DIGITAL_INPUT':
    if (state.rawInput == null) state.systemValue = null
    else {
      if (state.reversePolarity) state.systemValue = state.rawInput ? 0 : 1
      else state.systemValue = state.rawInput
    }
    break
  case 'DIGITAL_OUTPUT': {
    const rawValue = state.controlValue != null ? state.controlValue : state.safeState
    if (state.reversePolarity) state.rawOutput = rawValue ? 0 : 1
    else state.rawOutput = rawValue
    break
  }
  }
}

export function setChannelStates(...newStates: Array<SetChannelState>) {
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
      pubsub.publish('ChannelStates', {ChannelStates: newState})
      pubsub.publish(`ChannelStates/${newState.id}`, {ChannelState: newState})
      currentStates.set(newState.id, newState)
    })
  )
}

export function setChannelValues(...newValues: Array<SetChannelValue>) {
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
      case 'DIGITAL_OUTPUT':
        SetDigitalOutputValueType.assert(newValue)
        break
      case 'DISABLED':
        throw new Error(`Can't set the value on channel ${newValue.id}, it's disabled`)
      }
      if (!isChanged(current, newValue)) {
        return
      }
      const newState = {...current, ...newValue}
      calculateDerivedValue(newState)
      pubsub.publish('ChannelStates', {ChannelStates: newState})
      pubsub.publish(`ChannelStates/${newState.id}`, {ChannelState: newState})
      currentStates.set(newState.id, newState)
    })
  )
}
