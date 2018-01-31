// @flow

import gql from 'graphql-tag'
import get from 'lodash.get'
import {setIn} from '@jcoreio/mutate'

const channelStateSubscription = gql(`
  subscription ChannelState($channelId: String!) {
    ChannelState(channelId: $channelId)
  }  
`)

/**
 * Creates a function that initiates a subscription to a Channel State
 */
export default function createSubscribeToChannelState(
  props: Object,
  options?: {
    name?: string,
    channelPath?: Iterable<any>,
  } = {}
): (channelId: string) => Function {
  return function subscribeToChannelState(channelId: string): Function {
    const name = options.name || 'data'
    const channelPath = options.channelPath || ['Channel']
    return props[name].subscribeToMore({
      document: channelStateSubscription,
      variables: {
        channelId,
      },
      updateQuery: (prev: Object, update: {subscriptionData: {errors?: Array<Error>}}) => {
        const {subscriptionData: {[name]: data, errors}} = (update: any)
        if (errors) {
          errors.forEach(error => console.error(error.message)) // eslint-disable-line no-console
          return prev
        }
        if (!data) return prev
        const {ChannelState: newState} = data
        if (!newState.channelId) return prev
        if (get(prev, [...channelPath, 'channelId']) !== newState.channelId) return prev
        return setIn(prev, [...channelPath, 'state'], newState)
      },
    })
  }
}

