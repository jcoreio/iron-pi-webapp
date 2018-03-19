// @flow

import type {GraphQLFieldConfig} from 'graphql'
import * as graphql from 'graphql'
import type {GraphQLContext} from '../GraphQLContext'
import {NUM_MAPPING_PROBLEMS} from './constants'

export default function createNumMappingProblems(): GraphQLFieldConfig<any, GraphQLContext> {
  return {
    type: new graphql.GraphQLNonNull(graphql.GraphQLInt),
    description: 'Subscribes changes in the number of DataRouter mapping problems',
    args: {},
    subscribe(doc: any, args: any, context: GraphQLContext): AsyncIterator<any> {
      const {userId, pubsub} = context
      if (!userId) throw new graphql.GraphQLError('You must be logged in to subscribe to mapping problems')
      return pubsub.asyncIterator(NUM_MAPPING_PROBLEMS)
    }
  }
}

