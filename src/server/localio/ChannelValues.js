// @flow

import {Map} from 'immutable'
import pubsub from '../graphql/pubsub'
import type {ChannelValue} from '../../universal/types/Channel'

type ChannelValues = Map<number, ChannelValue>

let channelValues: ChannelValues = Map()
let channelValuesArray: ?Array<ChannelValue> = null

export function getChannelValues(): ChannelValues {
  return channelValues
}

export function getChannelValuesArray(): Array<ChannelValue> {
  if (channelValuesArray) return channelValuesArray
  return channelValuesArray = [...channelValues.sortBy((value, key) => key).values()]
}

export function getChannelValue(id: number): ?ChannelValue {
  return channelValues.get(id)
}

export function setChannelValues(...values: Array<ChannelValue>) {
  channelValuesArray = null // force lazy recompute
  channelValues = channelValues.withMutations(
    (channelValues: ChannelValues) => values.forEach((entry: ChannelValue) => {
      if (channelValues.get(entry.id, {}).current === entry.current) return
      pubsub.publish('ChannelValues', entry)
      channelValues.set(entry.id, entry)
    })
  )
}

