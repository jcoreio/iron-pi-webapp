// @flow

import * as redux from 'redux'
import {Record, Map} from 'immutable'
import type {RecordOf} from 'immutable'
import type {ChannelConfigs, ChannelValues} from '../localio/reduxChannelStates'
import type {DependentChannels} from '../localio/createDependentChannelSelector'
import type {ChannelState} from '../../universal/types/Channel'

export type StateFields = {
  channelConfigs: ChannelConfigs,
  channelValues: ChannelValues,
}

export type State = RecordOf<StateFields>

export const StateRecord = Record(({
  channelConfigs: Map(),
  channelValues: Map(),
}: StateFields))

export type Action = {type: $Subtype<string>}

export type Store = redux.Store<State, Action> & {
  getChannelConfigs: () => ChannelConfigs,
  getChannelValues: () => ChannelValues,
  getChannelState: (channelId: number) => ?ChannelState,
  getDependentChannels: () => DependentChannels,
}

