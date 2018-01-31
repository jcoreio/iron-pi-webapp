// @flow

import type {DependentChannelSelector} from './createDependentChannelSelector'
import type {ChannelStateSelector} from './createChannelStateSelector'
import type {ChannelState} from '../../universal/types/Channel'

type Options<S> = {
  selectChannelState: ChannelStateSelector<S>,
  selectDependentChannels: DependentChannelSelector<S>,
}

type Action = {
  payload: Array<$Subtype<{channelId: string}>>,
}

export type ChangedChannelStateSelector<S> = (stateBefore: S, stateAfter: S, action: Action) => Array<ChannelState>

export default function createChangedChannelStatesSelector<S>({
  selectChannelState,
  selectDependentChannels,
}: Options<S>): ChangedChannelStateSelector<S> {
  return (stateBefore: S, stateAfter: S, action: Action) => {
    if (stateBefore === stateAfter) return []

    const dependentChannels = selectDependentChannels(stateAfter)

    const checkedChannelIds: Set<string> = new Set()
    const changedChannelStates: Array<ChannelState> = []

    function checkForChanges(channelId: string) {
      if (checkedChannelIds.has(channelId)) return
      checkedChannelIds.add(channelId)

      const channelStateBefore = selectChannelState(channelId)(stateBefore)
      const channelStateAfter = selectChannelState(channelId)(stateAfter)
      if (channelStateBefore === channelStateAfter) return

      if (channelStateAfter) changedChannelStates.push(channelStateAfter)
      const depsForChannel = dependentChannels.get(channelId)
      if (depsForChannel) depsForChannel.forEach(checkForChanges)
    }

    for (let {channelId} of action.payload) checkForChanges(channelId)

    return changedChannelStates
  }
}

