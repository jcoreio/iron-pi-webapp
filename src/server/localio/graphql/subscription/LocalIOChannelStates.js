// @flow

import type {GraphQLFieldConfig} from 'graphql'
import * as graphql from 'graphql'
import type {GraphQLContext} from '../../../graphql/Context'
import {LocalIOChannelState as GraphQLLocalIOChannelState} from '../types/LocalIOChannelState'
import type {LocalIOChannelState} from '../../../../universal/localio/LocalIOChannel'

export default function createLocalIOChannelStates(): GraphQLFieldConfig<any, GraphQLContext> {
  return {
    type: new graphql.GraphQLList(new graphql.GraphQLNonNull(GraphQLLocalIOChannelState)),
    description: 'Subscribes to the state of all Local IO Channels',
    args: {
    },
    subscribe(doc: any, args: any, context: GraphQLContext): AsyncIterator<LocalIOChannelState> {
      const {userId, pubsub} = context
      if (!userId) throw new graphql.GraphQLError('You must be logged in to subscribe to channel states')
      return pubsub.asyncIterator(`LocalIOChannelStates`)
    }
  }
}

