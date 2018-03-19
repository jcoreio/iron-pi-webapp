// @flow

import type {GraphQLFieldConfig} from 'graphql'
import * as graphql from 'graphql'
import type {GraphQLContext} from '../GraphQLContext'
import {IN_CONNECT_MODE} from './constants'

export default function createInConnectMode(): GraphQLFieldConfig<any, GraphQLContext> {
  return {
    type: new graphql.GraphQLNonNull(graphql.GraphQLBoolean),
    args: {
    },
    subscribe(doc: any, args: any, context: GraphQLContext): AsyncIterator<any> {
      const {pubsub} = context
      return pubsub.asyncIterator(IN_CONNECT_MODE)
    }
  }
}

