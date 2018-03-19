// @flow

import type {GraphQLFieldConfig} from 'graphql'
import * as graphql from 'graphql'
import type {GraphQLContext} from '../GraphQLContext'
import {ROOT_PASSWORD_HAS_BEEN_SET} from './constants'

export default function createRootPasswordHasBeenSet(): GraphQLFieldConfig<any, GraphQLContext> {
  return {
    type: new graphql.GraphQLNonNull(graphql.GraphQLBoolean),
    args: {
    },
    subscribe(doc: any, args: any, context: GraphQLContext): AsyncIterator<any> {
      const {pubsub} = context
      return pubsub.asyncIterator(ROOT_PASSWORD_HAS_BEEN_SET)
    }
  }
}

