// @flow

import gql from 'graphql-tag'
import {setIn} from '@jcoreio/mutate'

/**
 * Creates a function that initiates a subscription to a tag value
 */
export default function createSubscribeToTagValue(
  props: Object,
  options?: {
    name?: string,
    tagValuePath?: Iterable<any>,
  } = {}
): (tag: string) => Function {
  const tagValuePath = options.tagValuePath || ['TagValue']

  const tagValueSubscription = gql(`
    subscription TagValue($tag: String!) {
      TagValue(tag: $tag)
    }  
  `)

  return function subscribeToTagValue(tag: string): Function {
    const name = options.name || 'data'
    return props[name].subscribeToMore({
      document: tagValueSubscription,
      variables: {
        tag,
      },
      updateQuery: (prev: Object, update: {subscriptionData: {errors?: Array<Error>}}) => {
        const {subscriptionData: {[name]: data, errors}} = (update: any)
        if (errors) {
          errors.forEach(error => console.error(error.message)) // eslint-disable-line no-console
          return prev
        }
        if (!data) return prev
        const {TagValue: newValue} = data
        return setIn(prev, tagValuePath, newValue)
      },
    })
  }
}

