// @flow

import {reify} from 'flow-runtime'
import type {Type} from 'flow-runtime'
import type {ChannelConfig, DigitalOutputConfig} from '../../universal/types/Channel'
import {Map} from 'immutable'
import type {Reducer} from 'redux'
import {createReducer} from 'mindfront-redux-utils'
import {assertChannelConfig} from '../../universal/types/Channel'
import findCycle from 'find-cycle/directed'

const NumberType = (reify: Type<number>)

export type ChannelValue =
  {|rawAnalogInput: number | null|} |
  {|rawDigitalInput: 0 | 1 | null|} |
  {|controlValue: 0 | 1 | null|}

const ChannelValueType = (reify: Type<ChannelValue>)

export type ChannelConfigUpdate = {id: number, config: ChannelConfig, value?: ChannelValue}
export type ChannelValueUpdate = {id: number, value: ChannelValue}
export type ChannelConfigs = Map<number, ChannelConfig>
export type ChannelValues = Map<number, ChannelValue>

export const defaultActionTypes = {
  SET_CHANNEL_CONFIGS: 'SET_CHANNEL_CONFIGS',
  SET_CHANNEL_VALUES: 'SET_CHANNEL_VALUES',
}

export type ActionTypes = {[action: $Keys<typeof defaultActionTypes>]: string}

export type SetChannelConfigsAction = {
  type: string,
  payload: Array<ChannelConfigUpdate>,
}

export type SetChannelValuesAction = {
  type: string,
  payload: Array<ChannelValueUpdate>,
}

export function checkForControlLogicCycle(configs: ChannelConfigs, startChannelIds: Iterable<number> = configs.keys()) {
  function * getSourceChannelIds(channelId: number): Iterator<number> {
    const config = configs.get(channelId)
    if (!config || config.mode !== 'DIGITAL_OUTPUT' || config.controlMode !== 'LOCAL_CONTROL') return
    const {controlLogic} = ((config: any): DigitalOutputConfig)
    if (!controlLogic) return
    for (let {channelId} of controlLogic) yield channelId
  }
  if (startChannelIds.length) {
    const cycle = findCycle(startChannelIds, getSourceChannelIds)
    if (cycle) {
      const error = new Error(`Changes would cause circular control logic`);
      (error: any).cycle = cycle
      throw error
    }
  }
}

export default function reduxChannelStates(actionTypes: ActionTypes = defaultActionTypes): {
  setChannelConfigs: (...payload: Array<ChannelConfigUpdate>) => SetChannelConfigsAction,
  setChannelValues: (...payload: Array<ChannelValueUpdate>) => SetChannelValuesAction,
  channelConfigsReducer: Reducer<ChannelConfigs, {type: $Subtype<string>}>,
  channelValuesReducer: Reducer<ChannelValues, {type: $Subtype<string>}>,
} {
  const {SET_CHANNEL_CONFIGS, SET_CHANNEL_VALUES} = actionTypes
  return {
    setChannelConfigs: (...payload: Array<ChannelConfigUpdate>) => ({
      type: SET_CHANNEL_CONFIGS,
      payload,
    }),
    setChannelValues: (...payload: Array<ChannelValueUpdate>) => ({
      type: SET_CHANNEL_VALUES,
      payload,
    }),
    channelConfigsReducer: createReducer(Map(), {
      [SET_CHANNEL_CONFIGS]: (configs: ChannelConfigs, {payload}: SetChannelConfigsAction) => (
        configs.withMutations((configs: ChannelConfigs) => {
          const localControlChannelIds = []
          for (let {id, config} of payload) {
            NumberType.assert(id)
            assertChannelConfig(config)
            configs.set(id, config)
            if (config.mode === 'DIGITAL_OUTPUT' && config.controlMode === 'LOCAL_CONTROL') {
              localControlChannelIds.push(id)
            }
          }
          checkForControlLogicCycle(configs, localControlChannelIds)
        })
      ),
      [SET_CHANNEL_VALUES]: (configs: ChannelConfigs, {payload}: SetChannelValuesAction) => {
        for (let {id, value} of payload) {
          const config = configs.get(id)
          if (!config) throw new Error(`channel ${id} must be configured before setting value`)
          if ('rawAnalogInput' in value) {
            if (config.mode !== 'ANALOG_INPUT') {
              throw new Error(`channel ${id} must be an ANALOG_INPUT to set its rawAnalogInput`)
            }
          } else if ('rawDigitalInput' in value) {
            if (config.mode !== 'DIGITAL_INPUT') {
              throw new Error(`channel ${id} must be an ANALOG_INPUT to set its rawAnalogInput`)
            }
          } else if ('controlValue' in value) {
            if (config.mode !== 'DIGITAL_OUTPUT') {
              throw new Error(`channel ${id} must be a DIGITAL_OUTPUT to set its controlValue`)
            }
            if (config.controlMode !== 'REMOTE_CONTROL') {
              throw new Error(`channel ${id} must be REMOTE_CONTROLled to set its controlValue`)
            }
          }
        }
        return configs
      }
    }),
    channelValuesReducer: createReducer(Map(), {
      [SET_CHANNEL_CONFIGS]: (values: ChannelValues, {payload}: SetChannelConfigsAction) => (
        values.withMutations((values: ChannelValues) => {
          for (let {id, config, value} of payload) {
            NumberType.assert(id)
            if (value) ChannelValueType.assert(value)
            switch (config.mode) {
            case 'ANALOG_INPUT': {
              if (value) {
                const {rawAnalogInput} = (value: any)
                if (rawAnalogInput === null || typeof rawAnalogInput === 'number') {
                  values.set(id, {rawAnalogInput})
                } else {
                  throw new Error('value must contain a valid rawAnalogInput when channel mode is ANALOG_INPUT')
                }
              } else values.set(id, {rawAnalogInput: null})
              break
            }
            case 'DIGITAL_INPUT': {
              if (value) {
                const {rawDigitalInput} = (value: any)
                if (rawDigitalInput === null || rawDigitalInput === 0 || rawDigitalInput === 1) {
                  values.set(id, {rawDigitalInput})
                } else {
                  throw new Error('value must contain a valid rawDigitalInput when channel mode is DIGITAL_INPUT')
                }
              } else values.set(id, {rawDigitalInput: null})
              break
            }
            case 'DIGITAL_OUTPUT': {
              if (value) {
                if (config.controlMode !== 'REMOTE_CONTROL') {
                  throw new Error('channel must be REMOTE_CONTROLled to set its controlValue')
                }
                const {controlValue} = (value: any)
                if (controlValue === null || controlValue === 0 || controlValue === 1) {
                  values.set(id, {controlValue})
                } else {
                  throw new Error('value must contain a valid controlValue when channel mode is DIGITAL_OUTPUT')
                }
              } else {
                switch (config.controlMode) {
                case 'FORCE_OFF':
                  values.set(id, {controlValue: 0})
                  break
                case 'FORCE_ON':
                  values.set(id, {controlValue: 1})
                  break
                case 'LOCAL_CONTROL':
                  values.delete(id)
                  break
                case 'REMOTE_CONTROL':
                  values.set(id, {controlValue: null})
                  break
                }
              }
              break
            }
            case 'DISABLED': {
              if (value) {
                throw new Error("can't set value when channel is DISABLED")
              }
              values.delete(id)
              break
            }
            }
          }
        })
      ),
      [SET_CHANNEL_VALUES]: (values: ChannelValues, {payload}: SetChannelValuesAction) => (
        values.withMutations((values: ChannelValues) => {
          for (let {id, value} of payload) {
            NumberType.assert(id)
            ChannelValueType.assert(value)
            values.set(id, value)
          }
        })
      ),
    }),
  }
}

