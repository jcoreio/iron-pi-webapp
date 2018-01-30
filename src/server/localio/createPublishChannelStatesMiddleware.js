// @flow

import type {Middleware, MiddlewareAPI, Dispatch} from 'redux'
import {createMiddleware} from 'mindfront-redux-utils'

import type {ActionTypes} from './reduxChannelStates'
import type {ChannelState} from '../../universal/types/Channel'
import type {ChangedChannelStateSelector} from './createChangedChannelStatesSelector'
import {defaultActionTypes} from './reduxChannelStates'

type Options<S> = {
  actionTypes?: ActionTypes,
  selectChangedChannelStates: ChangedChannelStateSelector<S>,
  publishChannelStates: (states: Array<ChannelState>) => any,
}

export default function createPublishChannelStatesMiddleware<S, A: {type: $Subtype<string>}>(
  options: Options<S>
): Middleware<S, A> {
  const {SET_CHANNEL_CONFIGS, SET_CHANNEL_VALUES} = options.actionTypes || defaultActionTypes
  const {
    selectChangedChannelStates,
    publishChannelStates,
  } = options

  const handleChange = ({getState}: MiddlewareAPI<S, A>) => (next: Dispatch<A>) => (action: A & {payload: Array<{id: number}>}) => {
    const stateBefore = getState()
    const result = next(action)
    const stateAfter = getState()

    const changedChannelStates = selectChangedChannelStates(stateBefore, stateAfter, action)
    if (changedChannelStates.length) publishChannelStates(changedChannelStates)

    return result
  }

  return createMiddleware({
    [SET_CHANNEL_CONFIGS]: handleChange,
    [SET_CHANNEL_VALUES]: handleChange,
  })
}

