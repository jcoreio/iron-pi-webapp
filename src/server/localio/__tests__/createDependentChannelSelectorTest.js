// @flow

import {expect} from 'chai'
import {Map as iMap} from 'immutable'
import createDependentChannelSelector from '../createDependentChannelSelector'
import type {ChannelConfigs} from '../reduxChannelStates'
import type {ControlCondition, ChannelConfig} from '../../../universal/types/Channel'

type State = {
  configs: ChannelConfigs,
}

describe('createDependentChannelSelector', () => {
  const selectDependentChannels = createDependentChannelSelector({
    selectChannelConfigs: (state: State) => state.configs,
  })

  function createLocalControl(...dependentChannelIds: Array<string>): ChannelConfig {
    return {
      mode: 'DIGITAL_OUTPUT',
      reversePolarity: false,
      safeState: 0,
      controlMode: 'LOCAL_CONTROL',
      controlLogic: dependentChannelIds.map((channelId: string, index: number): ControlCondition => {
        const condition: ControlCondition = {channelId, comparison: 'EQ', threshold: 1}
        if (index > 0) condition.operation = 'AND'
        return condition
      })
    }
  }

  const configs = iMap([
    ['6', createLocalControl('1', '2')],
    ['7', createLocalControl('2', '4', '6')],
    ['8', createLocalControl('5', '6', '7')],
    ['9', createLocalControl('1', '4', '6')],
    ['1', {mode: 'DIGITAL_INPUT', reversePolarity: false}],
    ['2', {mode: 'DIGITAL_INPUT', reversePolarity: false}],
    ['3', {mode: 'DIGITAL_INPUT', reversePolarity: false}],
    ['4', {mode: 'DIGITAL_INPUT', reversePolarity: false}],
    ['5', {mode: 'DIGITAL_INPUT', reversePolarity: false}],
  ])

  it('selects correct values', () => {
    expect(selectDependentChannels({configs})).to.deep.equal(new Map([
      ['1', new Set(['6', '9'])],
      ['2', new Set(['6', '7'])],
      ['3', new Set()],
      ['4', new Set(['7', '9'])],
      ['5', new Set(['8'])],
      ['6', new Set(['7', '8', '9'])],
      ['7', new Set(['8'])],
      ['8', new Set()],
      ['9', new Set()],
    ]))
  })
  it('memoizes', () => {
    expect(selectDependentChannels({configs})).to.equal(selectDependentChannels({configs}))
  })
})

