// @flow

import * as graphql from 'graphql'
import type {PubSubEngine} from 'graphql-subscriptions'

import createChannelState from './ChannelState'
import createChannelStates from './ChannelStates'

type Options = {
  pubsub: PubSubEngine,
}

export default function createSubscription(options: Options): graphql.GraphQLObjectType {
  return new graphql.GraphQLObjectType({
    name: 'Subscription',
    fields: {
      ChannelState: createChannelState(options),
      ChannelStates: createChannelStates(options),
    }
  })
}
