// @flow

import {expect} from 'chai'
import {Map} from 'immutable'
import type {ChannelConfigs, ChannelValues} from '../reduxChannelStates'
import createChangedChannelStatesSelector from '../createChangedChannelStatesSelector'
import createChannelStateSelector from '../createChannelStateSelector'
import createDependentChannelSelector from '../createDependentChannelSelector'
import reduxChannelStates from '../reduxChannelStates'

type State = {
  config: ChannelConfigs,
  values: ChannelValues,
}

describe('createChangedChannelStateSelector', function () {
  const stateBefore: State = {
    config: Map([
      [1, {mode: 'DIGITAL_INPUT', reversePolarity: false}],
      [2, {mode: 'ANALOG_INPUT', precision: 0, min: 0, max: 10}],
      [3, {mode: 'DIGITAL_INPUT', reversePolarity: false}],
      [4, {mode: 'DIGITAL_OUTPUT', reversePolarity: false, safeState: 0, controlMode: 'LOCAL_CONTROL', controlLogic: [
        {channelId: 1, comparison: 'EQ', threshold: 1},
        {operation: 'AND', channelId: 2, comparison: 'GT', threshold: 5},
      ]}],
      [5, {mode: 'DIGITAL_OUTPUT', reversePolarity: false, safeState: 0, controlMode: 'LOCAL_CONTROL', controlLogic: [
        {channelId: 3, comparison: 'NE', threshold: 1},
        {operation: 'OR', channelId: 4, comparison: 'EQ', threshold: 1},
      ]}],
      [6, {mode: 'DIGITAL_OUTPUT', reversePolarity: false, safeState: 0, controlMode: 'LOCAL_CONTROL', controlLogic: [
        {channelId: 5, comparison: 'EQ', threshold: 1},
      ]}],
    ]),
    values: Map([
      [1, {rawDigitalInput: 0}],
      [2, {rawAnalogInput: 2}],
      [3, {rawDigitalInput: 1}],
    ]),
  }

  const {setChannelValues} = reduxChannelStates()

  const selectChannelConfigs = state => state.config
  const selectChannelValues = state => state.values

  const selectChannelState = createChannelStateSelector({
    selectChannelConfigs,
    selectChannelValues,
  })

  const selectDependentChannels = createDependentChannelSelector({
    selectChannelConfigs
  })

  const selectChangedChannelStates = createChangedChannelStatesSelector({
    selectChannelState,
    selectDependentChannels,
  })

  it('works', () => {
    expect(selectChangedChannelStates(
      stateBefore,
      {...stateBefore, values: stateBefore.values.merge(Map([
        [1, {rawDigitalInput: 0}]
      ]))},
      setChannelValues({id: 1, value: {rawDigitalInput: 0}})
    )).to.deep.equal([])

    expect(selectChangedChannelStates(
      stateBefore,
      {...stateBefore, values: stateBefore.values.merge(Map([
        [1, {rawDigitalInput: 1}]
      ]))},
      setChannelValues({id: 1, value: {rawDigitalInput: 1}})
    )).to.deep.equal([
      {id: 1, mode: 'DIGITAL_INPUT', reversePolarity: false, rawInput: 1, systemValue: 1}
    ])

    expect(selectChangedChannelStates(
      stateBefore,
      {...stateBefore, values: stateBefore.values.merge(Map([
        [1, {rawDigitalInput: 1}],
        [2, {rawAnalogInput: 6}],
      ]))},
      setChannelValues(
        {id: 1, value: {rawDigitalInput: 1}},
        {id: 2, value: {rawAnalogInput: 6}},
      )
    ).sort((a, b) => a.id - b.id)).to.deep.equal([
      {id: 1, mode: 'DIGITAL_INPUT', reversePolarity: false, rawInput: 1, systemValue: 1},
      {id: 2, mode: 'ANALOG_INPUT', rawInput: 6, systemValue: 6},
      {id: 4, mode: 'DIGITAL_OUTPUT', reversePolarity: false, safeState: 0, controlMode: 'LOCAL_CONTROL', controlValue: 1, rawOutput: 1},
      {id: 5, mode: 'DIGITAL_OUTPUT', reversePolarity: false, safeState: 0, controlMode: 'LOCAL_CONTROL', controlValue: 1, rawOutput: 1},
      {id: 6, mode: 'DIGITAL_OUTPUT', reversePolarity: false, safeState: 0, controlMode: 'LOCAL_CONTROL', controlValue: 1, rawOutput: 1},
    ])


    expect(selectChangedChannelStates(
      stateBefore,
      {...stateBefore, values: stateBefore.values.merge(Map([
        [3, {rawDigitalInput: 0}],
      ]))},
      setChannelValues(
        {id: 3, value: {rawDigitalInput: 0}},
      )
    ).sort((a, b) => a.id - b.id)).to.deep.equal([
      {id: 3, mode: 'DIGITAL_INPUT', reversePolarity: false, rawInput: 0, systemValue: 0},
      {id: 5, mode: 'DIGITAL_OUTPUT', reversePolarity: false, safeState: 0, controlMode: 'LOCAL_CONTROL', controlValue: 1, rawOutput: 1},
      {id: 6, mode: 'DIGITAL_OUTPUT', reversePolarity: false, safeState: 0, controlMode: 'LOCAL_CONTROL', controlValue: 1, rawOutput: 1},
    ])
  })
})

