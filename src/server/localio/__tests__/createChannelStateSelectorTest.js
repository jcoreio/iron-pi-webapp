// @flow

import {expect} from 'chai'
import {Map} from 'immutable'
import createChannelStateSelector from '../createChannelStateSelector'
import type {ChannelConfigs} from '../reduxChannelStates'

describe('createChannelStateSelector', () => {
  const selectChannelState = createChannelStateSelector({
    selectChannelConfigs: state => state.configs,
    selectChannelValues: state => state.values,
  })

  it('works for ANALOG_INPUT channels', () => {
    const configs = Map([['1', {mode: 'ANALOG_INPUT', precision: 0, min: 0, max: 10, calibration: {
      points: [
        {x: 0, y: 0},
        {x: 1, y: 10},
      ]
    }}]])

    expect(selectChannelState('1')({configs, values: Map([['1', {rawAnalogInput: 0.5}]])})).to.deep.equal({
      channelId: '1',
      mode: 'ANALOG_INPUT',
      rawInput: 0.5,
      systemValue: 5,
    })
    expect(selectChannelState('1')({configs, values: Map([['1', {rawAnalogInput: 0.75}]])})).to.deep.equal({
      channelId: '1',
      mode: 'ANALOG_INPUT',
      rawInput: 0.75,
      systemValue: 7.5,
    })
    expect(selectChannelState('1')({configs, values: Map([['1', {rawAnalogInput: null}]])})).to.deep.equal({
      channelId: '1',
      mode: 'ANALOG_INPUT',
      rawInput: null,
      systemValue: null,
    })
  })
  it('works for DIGITAL_INPUT channels', () => {
    let configs = Map([['1', {mode: 'DIGITAL_INPUT', reversePolarity: true}]])

    expect(selectChannelState('1')({configs, values: Map([['1', {rawDigitalInput: 0}]])})).to.deep.equal({
      channelId: '1',
      mode: 'DIGITAL_INPUT',
      reversePolarity: true,
      rawInput: 0,
      systemValue: 1,
    })
    expect(selectChannelState('1')({configs, values: Map([['1', {rawDigitalInput: null}]])})).to.deep.equal({
      channelId: '1',
      mode: 'DIGITAL_INPUT',
      reversePolarity: true,
      rawInput: null,
      systemValue: null,
    })

    configs = Map([['1', {mode: 'DIGITAL_INPUT', reversePolarity: false}]])

    expect(selectChannelState('1')({configs, values: Map([['1', {rawDigitalInput: 0}]])})).to.deep.equal({
      channelId: '1',
      mode: 'DIGITAL_INPUT',
      reversePolarity: false,
      rawInput: 0,
      systemValue: 0,
    })
    expect(selectChannelState('1')({configs, values: Map([['1', {rawDigitalInput: null}]])})).to.deep.equal({
      channelId: '1',
      mode: 'DIGITAL_INPUT',
      reversePolarity: false,
      rawInput: null,
      systemValue: null,
    })
  })
  it('works for non-LOCAL_CONTROL DIGITAL_OUTPUT channels', () => {
    let configs = Map([['1', {mode: 'DIGITAL_OUTPUT', reversePolarity: true, safeState: 0, controlMode: 'REMOTE_CONTROL'}]])

    expect(selectChannelState('1')({configs, values: Map([['1', {controlValue: 0}]])})).to.deep.equal({
      channelId: '1',
      mode: 'DIGITAL_OUTPUT',
      reversePolarity: true,
      safeState: 0,
      controlMode: 'REMOTE_CONTROL',
      controlValue: 0,
      rawOutput: 1,
    })

    expect(selectChannelState('1')({configs, values: Map([['1', {controlValue: 1}]])})).to.deep.equal({
      channelId: '1',
      mode: 'DIGITAL_OUTPUT',
      reversePolarity: true,
      safeState: 0,
      controlMode: 'REMOTE_CONTROL',
      controlValue: 1,
      rawOutput: 0,
    })

    expect(selectChannelState('1')({configs, values: Map([['1', {controlValue: null}]])})).to.deep.equal({
      channelId: '1',
      mode: 'DIGITAL_OUTPUT',
      reversePolarity: true,
      safeState: 0,
      controlMode: 'REMOTE_CONTROL',
      controlValue: null,
      rawOutput: 1,
    })

    configs = Map([['1', {mode: 'DIGITAL_OUTPUT', reversePolarity: true, safeState: 1, controlMode: 'REMOTE_CONTROL'}]])

    expect(selectChannelState('1')({configs, values: Map([['1', {controlValue: 1}]])})).to.deep.equal({
      channelId: '1',
      mode: 'DIGITAL_OUTPUT',
      reversePolarity: true,
      safeState: 1,
      controlMode: 'REMOTE_CONTROL',
      controlValue: 1,
      rawOutput: 0,
    })

    expect(selectChannelState('1')({configs, values: Map([['1', {controlValue: null}]])})).to.deep.equal({
      channelId: '1',
      mode: 'DIGITAL_OUTPUT',
      reversePolarity: true,
      safeState: 1,
      controlMode: 'REMOTE_CONTROL',
      controlValue: null,
      rawOutput: 0,
    })

    configs = Map([['1', {mode: 'DIGITAL_OUTPUT', reversePolarity: false, safeState: 1, controlMode: 'REMOTE_CONTROL'}]])

    expect(selectChannelState('1')({configs, values: Map([['1', {controlValue: 1}]])})).to.deep.equal({
      channelId: '1',
      mode: 'DIGITAL_OUTPUT',
      reversePolarity: false,
      safeState: 1,
      controlMode: 'REMOTE_CONTROL',
      controlValue: 1,
      rawOutput: 1,
    })

    expect(selectChannelState('1')({configs, values: Map([['1', {controlValue: null}]])})).to.deep.equal({
      channelId: '1',
      mode: 'DIGITAL_OUTPUT',
      reversePolarity: false,
      safeState: 1,
      controlMode: 'REMOTE_CONTROL',
      controlValue: null,
      rawOutput: 1,
    })
  })
  it('works for LOCAL_CONTROL channels', () => {
    let configs: ChannelConfigs = Map([
      ['1', {mode: 'DIGITAL_INPUT', reversePolarity: true}],
      ['2', {mode: 'ANALOG_INPUT', precision: 0, min: 0, max: 10}],
      ['3', {mode: 'DIGITAL_OUTPUT', reversePolarity: true, safeState: 0, controlMode: 'LOCAL_CONTROL', controlLogic: [
        {channelId: '1', comparison: 'EQ', threshold: 1},
        {operation: 'AND', channelId: '2', comparison: 'GTE', threshold: 0.5},
      ]}],
      ['4', {mode: 'DIGITAL_OUTPUT', reversePolarity: false, safeState: 0, controlMode: 'LOCAL_CONTROL', controlLogic: [
        {channelId: '2', comparison: 'LT', threshold: 0.75},
        {operation: 'OR', channelId: '3', comparison: 'NE', threshold: 1},
      ]}],
    ])

    expect(selectChannelState('3')({configs, values: Map([
      ['1', {rawDigitalInput: 0}],
      ['2', {rawAnalogInput: 0.6}],
    ])})).to.deep.equal({
      channelId: '3',
      mode: 'DIGITAL_OUTPUT',
      reversePolarity: true,
      safeState: 0,
      controlMode: 'LOCAL_CONTROL',
      controlValue: 1,
      rawOutput: 0,
    })

    expect(selectChannelState('4')({configs, values: Map([
      ['1', {rawDigitalInput: 0}],
      ['2', {rawAnalogInput: 0.6}],
    ])})).to.deep.equal({
      channelId: '4',
      mode: 'DIGITAL_OUTPUT',
      reversePolarity: false,
      safeState: 0,
      controlMode: 'LOCAL_CONTROL',
      controlValue: 1,
      rawOutput: 1,
    })

    expect(selectChannelState('3')({configs, values: Map([
      ['1', {rawDigitalInput: 1}],
      ['2', {rawAnalogInput: 0.75}],
    ])})).to.deep.equal({
      channelId: '3',
      mode: 'DIGITAL_OUTPUT',
      reversePolarity: true,
      safeState: 0,
      controlMode: 'LOCAL_CONTROL',
      controlValue: 0,
      rawOutput: 1,
    })

    expect(selectChannelState('4')({configs, values: Map([
      ['1', {rawDigitalInput: 1}],
      ['2', {rawAnalogInput: 0.75}],
    ])})).to.deep.equal({
      channelId: '4',
      mode: 'DIGITAL_OUTPUT',
      reversePolarity: false,
      safeState: 0,
      controlMode: 'LOCAL_CONTROL',
      controlValue: 0,
      rawOutput: 0,
    })
  })
  it('works for DISABLED channels', () => {
    const configs = Map([['1', {mode: 'DISABLED'}]])

    expect(selectChannelState('1')({configs, values: Map()})).to.deep.equal({
      channelId: '1',
      mode: 'DISABLED',
    })
  })
})

