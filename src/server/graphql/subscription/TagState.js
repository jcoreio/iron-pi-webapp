// @flow

import type {GraphQLFieldConfig} from 'graphql'
import * as graphql from 'graphql'
import type {GraphQLContext} from '../GraphQLContext'
import {TAG_STATE} from './constants'
import TagState from '../types/TagState'

export default function createTagValue(): GraphQLFieldConfig<any, GraphQLContext> {
  return {
    type: TagState,
    description: 'Subscribes to the state of a single tag',
    args: {
      tag: {
        type: new graphql.GraphQLNonNull(graphql.GraphQLString),
        description: 'The tag to subscribe to',
      },
    },
    subscribe(doc: any, {tag}: {tag: string}, context: GraphQLContext): AsyncIterator<any> {
      const {userId, pubsub} = context
      if (!userId) throw new graphql.GraphQLError('You must be logged in to subscribe to tag states')
      return pubsub.asyncIterator(`${TAG_STATE}/${tag}`)
    }
  }
}

