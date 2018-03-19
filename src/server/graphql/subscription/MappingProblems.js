// @flow

import type {GraphQLFieldConfig} from 'graphql'
import * as graphql from 'graphql'
import type {GraphQLContext} from '../GraphQLContext'
import {MAPPING_PROBLEMS} from './constants'
import GraphQLMappingProblem from '../types/MappingProblem'

export default function createMappingProblems(): GraphQLFieldConfig<any, GraphQLContext> {
  return {
    type: new graphql.GraphQLList(new graphql.GraphQLNonNull(GraphQLMappingProblem)),
    description: 'Subscribes changes in the DataRouter mapping problems',
    args: {},
    subscribe(doc: any, args: any, context: GraphQLContext): AsyncIterator<any> {
      const {userId, pubsub} = context
      if (!userId) throw new graphql.GraphQLError('You must be logged in to subscribe to mapping problems')
      return pubsub.asyncIterator(MAPPING_PROBLEMS)
    }
  }
}

