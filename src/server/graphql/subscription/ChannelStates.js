// @flow

import type {GraphQLFieldConfig} from 'graphql'
import * as graphql from 'graphql'
import GraphQLJSON from 'graphql-type-json'
import type {PubSubEngine} from 'graphql-subscriptions'
import type {Context} from '../Context'
import type {ChannelState} from '../../../universal/types/Channel'

type Options = {
  pubsub: PubSubEngine,
}

export default function createChannelStates({pubsub}: Options): GraphQLFieldConfig<any, Context> {
  return {
    type: new graphql.GraphQLNonNull(GraphQLJSON),
    description: 'Subscribes to the state of all channels',
    subscribe(doc: any, args: any, context: Context): AsyncIterator<ChannelState> {
      const {userId} = context
      if (!userId) throw new graphql.GraphQLError('You must be logged in to update Channels')
      return pubsub.asyncIterator('ChannelStates')
    }
  }
}


