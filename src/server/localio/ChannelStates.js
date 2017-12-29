// @flow

import {Map} from 'immutable'
import pubsub from '../graphql/pubsub'
import {isEqual} from 'lodash'
import type {ChannelState} from '../../universal/types/Channel'

type ChannelStates = Map<number, ChannelState>

let channelStates: ChannelStates = Map()
let channelStatesArray: ?Array<ChannelState> = null

export function getChannelStates(): ChannelStates {
  return channelStates
}

export function getChannelStatesArray(): Array<ChannelState> {
  if (channelStatesArray) return channelStatesArray
  return channelStatesArray = [...channelStates.sortBy((value, key) => key).values()]
}

export function getChannelState(id: number): ?ChannelState {
  return channelStates.get(id)
}

export function setChannelStates(...values: Array<ChannelState>) {
  channelStatesArray = null // force lazy recompute
  channelStates = channelStates.withMutations(
    (channelStates: ChannelStates) => values.forEach((entry: ChannelState) => {
      if (isEqual(channelStates.get(entry.id), entry)) return
      pubsub.publish('ChannelStates', entry)
      channelStates.set(entry.id, entry)
    })
  )
}

