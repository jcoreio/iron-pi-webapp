// @flow

import type {GraphQLFieldConfig} from 'graphql'
import * as graphql from 'graphql'
import type {Context} from '../Context'
import {ROOT_PASSWORD_HAS_BEEN_SET} from './constants'

export default function createRootPasswordHasBeenSet(): GraphQLFieldConfig<any, Context> {
  return {
    type: new graphql.GraphQLNonNull(graphql.GraphQLBoolean),
    args: {
    },
    subscribe(doc: any, args: any, context: Context): AsyncIterator<any> {
      const {pubsub} = context
      return pubsub.asyncIterator(ROOT_PASSWORD_HAS_BEEN_SET)
    }
  }
}

