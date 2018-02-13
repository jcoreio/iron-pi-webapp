// @flow

import type {GraphQLFieldConfig} from 'graphql'
import * as graphql from 'graphql'
import GraphQLJSON from 'graphql-type-json'
import type {Context} from '../Context'
import type {ChannelState} from '../../../universal/types/Channel'

export default function createChannelStates(): GraphQLFieldConfig<any, Context> {
  return {
    type: new graphql.GraphQLNonNull(GraphQLJSON),
    description: 'Subscribes to the state of all channels',
    subscribe(doc: any, args: any, context: Context): AsyncIterator<ChannelState> {
      const {userId, pubsub} = context
      if (!userId) throw new graphql.GraphQLError('You must be logged in to update Channels')
      return pubsub.asyncIterator('ChannelStates')
    }
  }
}


