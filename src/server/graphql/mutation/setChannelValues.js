// @flow

import type {GraphQLFieldConfig} from 'graphql'
import * as graphql from 'graphql'
import type {Context} from '../Context'
import GraphQLJSON from 'graphql-type-json'
import {setChannelValues} from '../../localio/ChannelStates'
import type {ChannelState, SetChannelValue} from '../../../universal/types/Channel'

type Options = {
}

export default function createSetChannelValues(options: Options): GraphQLFieldConfig<any, Context> {
  return {
    type: new graphql.GraphQLList(GraphQLJSON),
    args: {
      values: {
        type: new graphql.GraphQLNonNull(new graphql.GraphQLList(GraphQLJSON)),
      },
    },
    resolve(doc: any, {values}: {values: Array<SetChannelValue>}, context: Context): Array<ChannelState> {
      const {scopes} = context
      if (!scopes || scopes.indexOf('test:update:channelStates') < 0) {
        throw new graphql.GraphQLError('Forbidden')
      }

      return setChannelValues(...values)
    },
  }
}

