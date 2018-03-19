// @flow

import type {GraphQLFieldConfig} from 'graphql'
import * as graphql from 'graphql'
import type {GraphQLContext} from '../../../graphql/GraphQLContext'
import {LocalIOChannelState as GraphQLLocalIOChannelState} from '../types/LocalIOChannelState'
import type {LocalIOChannelState} from '../../../../universal/localio/LocalIOChannel'

export default function createLocalIOChannelState(): GraphQLFieldConfig<any, GraphQLContext> {
  return {
    type: new graphql.GraphQLNonNull(GraphQLLocalIOChannelState),
    description: 'Subscribes to the state of a single Local IO Channel',
    args: {
      id: {
        type: new graphql.GraphQLNonNull(graphql.GraphQLInt),
        description: 'The id of the Local IO Channel to subscribe to',
      },
    },
    subscribe(doc: any, {id}: {id: number}, context: GraphQLContext): AsyncIterator<LocalIOChannelState> {
      const {userId, pubsub} = context
      if (!userId) throw new graphql.GraphQLError('You must be logged in to subscribe to channel states')
      return pubsub.asyncIterator(`LocalIOChannelState/${id}`)
    }
  }
}

