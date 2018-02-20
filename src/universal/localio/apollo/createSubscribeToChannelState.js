// @flow

import gql from 'graphql-tag'
import get from 'lodash.get'
import {setIn} from '@jcoreio/mutate'

export const MODE_AND_SYSTEM_VALUE_SELECTION = `{
  mode
  systemValue 
}`

export const ALL_FIELDS_SELECTION = `{
  mode
  systemValue
  ... on InputChannelState {
    rawInput
  }
  ... on DigitalChannelState {
    reversePolarity
  }
  ... on DigitalOutputState {
    safeState
    controlValue
    rawOutput
  }
}`

/**
 * Creates a function that initiates a subscription to a Channel State
 */
export default function createSubscribeToChannelState(
  props: Object,
  options?: {
    name?: string,
    channelPath?: Iterable<any>,
    selection?: string,
  } = {}
): (id: number) => Function {
  const selection = options.selection || MODE_AND_SYSTEM_VALUE_SELECTION
  const channelStateSubscription = gql(`
    subscription LocalIOChannelState($id: Int!) {
      LocalIOChannelState(id: $id) ${selection}
    }  
  `)

  return function subscribeToChannelState(id: number): Function {
    const name = options.name || 'data'
    const channelPath = options.channelPath || ['LocalIOChannel']
    return props[name].subscribeToMore({
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
        const {LocalIOChannelState} = data
        if (!LocalIOChannelState) return prev
        const {id, state} = LocalIOChannelState
        if (get(prev, [...channelPath, 'id']) !== id) return prev
        return setIn(prev, [...channelPath, 'state'], state)
      },
    })
  }
}

