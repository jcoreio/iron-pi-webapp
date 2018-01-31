/* @flow */

import {createStore, applyMiddleware} from 'redux'
import {reducer} from './index'
import createPublishChannelStatesMiddleware from '../localio/createPublishChannelStatesMiddleware'
import {StateRecord} from './types'
import type {State} from './types'
import createChannelStateSelector from '../localio/createChannelStateSelector'
import createDependentChannelSelector from '../localio/createDependentChannelSelector'
import createChangedChannelStatesSelector from '../localio/createChangedChannelStatesSelector'
import type {ChannelState} from '../../universal/types/Channel'

type Options = {
  initialState?: State,
  publishChannelStates: (states: Array<ChannelState>) => any,
}

const selectChannelConfigs = (state: State) => state.channelConfigs
const selectChannelValues = (state: State) => state.channelValues

const selectChannelState = createChannelStateSelector({
  selectChannelConfigs,
  selectChannelValues,
})

const selectDependentChannels = createDependentChannelSelector({
  selectChannelConfigs,
})

const selectChangedChannelStates = createChangedChannelStatesSelector({
  selectChannelState,
  selectDependentChannels,
})

export default (options: Options): Store => {
  const initialState = options.initialState || StateRecord()
  const {publishChannelStates} = options
  const store: Store = createStore(
    reducer,
    initialState,
    applyMiddleware(
      createPublishChannelStatesMiddleware({
        selectChangedChannelStates,
        publishChannelStates,
      })
    )
  )
  store.getChannelConfigs = () => selectChannelConfigs(store.getState())
  store.getChannelValues = () => selectChannelValues(store.getState())
  store.getDependentChannels = () => selectDependentChannels(store.getState())
  store.getChannelState = (channelId: string) => selectChannelState(channelId)(store.getState())
  return store
}

