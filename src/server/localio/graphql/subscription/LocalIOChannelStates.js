// @flow

import type {GraphQLFieldConfig} from 'graphql'
import * as graphql from 'graphql'
import type {Context} from '../../../graphql/Context'
import {LocalIOChannelIdAndState} from '../types/LocalIOChannelState'
import type {LocalIOChannelState} from '../../../../universal/localio/LocalIOChannel'

export default function createLocalIOChannelStates(): GraphQLFieldConfig<any, Context> {
  return {
    type: new graphql.GraphQLList(new graphql.GraphQLNonNull(LocalIOChannelIdAndState)),
    description: 'Subscribes to the state of all Local IO Channels',
    args: {
    },
    subscribe(doc: any, args: any, context: Context): AsyncIterator<{id: number, state: LocalIOChannelState}> {
      const {userId, pubsub} = context
      if (!userId) throw new graphql.GraphQLError('You must be logged in to subscribe to channel states')
      return pubsub.asyncIterator(`LocalIOChannelStates`)
    }
  }
}

