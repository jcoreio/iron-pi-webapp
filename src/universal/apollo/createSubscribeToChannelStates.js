// @flow

import gql from 'graphql-tag'
import get from 'lodash.get'
import {setIn} from '@jcoreio/mutate'

const channelStatesSubscription = gql(`
  subscription ChannelStates {
    ChannelStates
  }  
`)

/**
 * Creates a function that initiates a subscription to all Channel States
 */
export default function createSubscribeToChannelStates(
  props: Object,
  options?: {
    name?: string,
    channelsPath?: Iterable<any>,
  } = {}
): () => Function {
  return function subscribeToChannelStates(): Function {
    const name = options.name || 'data'
    const channelsPath = options.channelsPath || ['Channels']
    return props[name].subscribeToMore({
      document: channelStatesSubscription,
      updateQuery: (prev: Object, update: {subscriptionData: {errors?: Array<Error>}}) => {
        const {subscriptionData: {[name]: data, errors}} = (update: any)
        if (errors) {
          errors.forEach(error => console.error(error.message)) // eslint-disable-line no-console
          return prev
        }
        if (!data) return prev
        const {ChannelStates: newState} = data
        if (!newState.id) return prev
        const Channels = get(prev, channelsPath)
        const index = Channels.findIndex(channel => channel.id === newState.id)
        return index >= 0
          ? setIn(prev, [...channelsPath, index, 'state'], newState)
          : prev
      },
    })
  }
}
