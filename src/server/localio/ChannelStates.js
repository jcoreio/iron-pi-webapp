// @flow

import {Map} from 'immutable'
import pubsub from '../graphql/pubsub'
import {isEqual} from 'lodash'
import type {ChannelState} from '../../universal/types/Channel'

type ChannelStates = Map<number, ChannelState>

let channelStates: ChannelStates = Map()

export function getChannelStates(): ChannelStates {
  return channelStates
}

export function getChannelState(id: number): ?ChannelState {
  return channelStates.get(id)
}

export function setChannelStates(...values: Array<ChannelState>) {
  channelStates = channelStates.withMutations(
    (channelStates: ChannelStates) => values.forEach((entry: ChannelState) => {
      if (isEqual(channelStates.get(entry.id), entry)) return
      pubsub.publish('ChannelStates', {ChannelStates: entry})
      channelStates.set(entry.id, entry)
    })
  )
}

