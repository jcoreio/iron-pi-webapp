// @flow

import {createSelector} from 'reselect'
import type {ChannelConfigs} from './reduxChannelStates'
import type {ChannelConfig, DigitalOutputConfig} from '../../universal/types/Channel'

export type DependentChannels = Map<number, Set<number>>
export type DependentChannelSelector<S> = (state: S) => DependentChannels

type Options<S> = {
  selectChannelConfigs: (state: S) => ChannelConfigs,
}

export default function createDependentChannelSelector<S>({
  selectChannelConfigs,
}: Options<S>): DependentChannelSelector<S> {
  return createSelector(
    selectChannelConfigs,
    (configs: ChannelConfigs): DependentChannels => {
      const dependencies: DependentChannels = new Map()
      configs.forEach((config: ChannelConfig, id: number) => {
        if (!dependencies.has(id)) dependencies.set(id, new Set())
        if (config.mode !== 'DIGITAL_OUTPUT' && config.controlMode !== 'LOCAL_CONTROL') return
        const {controlLogic} = ((config: any): DigitalOutputConfig)
        if (controlLogic == null) return
        for (let {channelId: dependentChannelId} of controlLogic) {
          const depsForChannel = dependencies.get(dependentChannelId) || new Set()
          dependencies.set(dependentChannelId, depsForChannel)
          depsForChannel.add(id)
        }
      })
      return dependencies
    }
  )
}

