// @flow

import type {GraphQLFieldConfig} from 'graphql'
import * as graphql from 'graphql'
import GraphQLJSON from 'graphql-type-json'
import type {Context} from '../Context'
import type {ChannelState} from '../../../universal/types/Channel'

export default function createChannelState(): GraphQLFieldConfig<any, Context> {
  return {
    type: new graphql.GraphQLNonNull(GraphQLJSON),
    description: 'Subscribes to the state of a single channel',
    args: {
      channelId: {
        type: new graphql.GraphQLNonNull(graphql.GraphQLString),
        description: 'The id of the channel to subscribe to',
      },
    },
    subscribe(doc: any, {channelId}: {channelId: string}, context: Context): AsyncIterator<ChannelState> {
      const {userId, pubsub} = context
      if (!userId) throw new graphql.GraphQLError('You must be logged in to update Channels')
      return pubsub.asyncIterator(`ChannelState/${channelId}`)
    }
  }
}

