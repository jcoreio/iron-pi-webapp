// @flow

import type {GraphQLFieldConfig} from 'graphql'
import * as graphql from 'graphql'
import type {Context} from '../Context'
import {IN_CONNECT_MODE} from './constants'

export default function createInConnectMode(): GraphQLFieldConfig<any, Context> {
  return {
    type: new graphql.GraphQLNonNull(graphql.GraphQLBoolean),
    args: {
    },
    subscribe(doc: any, args: any, context: Context): AsyncIterator<any> {
      const {pubsub} = context
      return pubsub.asyncIterator(IN_CONNECT_MODE)
    }
  }
}

