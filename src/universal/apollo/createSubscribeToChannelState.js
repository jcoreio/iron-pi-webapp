// @flow

import gql from 'graphql-tag'
import {get} from 'lodash'
import {setIn} from '@jcoreio/mutate'

const channelStateSubscription = gql(`
  subscription ChannelState($id: Int!) {
    ChannelState(id: $id)
  }  
`)

export default function createSubscribeToChannelState(
  props: Object,
  options?: {
    name?: string,
    channelPath?: Iterable<any>,
  } = {}
): (id: number) => Function {
  return function subscribeToChannelState(id: number): Function {
    const name = options.name || 'data'
    const channelPath = options.channelPath || ['Channel']
    return props.data.subscribeToMore({
      document: channelStateSubscription,
      variables: {
        id,
      },
      updateQuery: (prev: Object, update: {subscriptionData: {errors?: Array<Error>}}) => {
        const {subscriptionData: {[name]: data, errors}} = (update: any)
        if (errors) {
          errors.forEach(error => console.error(error.message)) // eslint-disable-line no-console
          return prev
        }
        if (!data) return prev
        const {ChannelState: newState} = data
        if (!newState.id) return prev
        if (get(prev, [...channelPath, 'id']) !== newState.id) return prev
        return setIn(prev, [...channelPath, 'state'], newState)
      },
    })
  }
}

