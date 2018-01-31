// @flow

import type {GraphQLFieldConfig} from 'graphql'
import * as graphql from 'graphql'
import type {Context} from '../Context'
import GraphQLJSON from 'graphql-type-json'
import type {ChannelState} from '../../../universal/types/Channel'
import type {ChannelValueUpdate} from '../../localio/reduxChannelStates'
import type {Store} from '../../redux/types'
import {setChannelValues} from '../../redux'

type Options = {
  store: Store,
}

export default function createSetChannelValues({store}: Options): GraphQLFieldConfig<any, Context> {
  return {
    type: new graphql.GraphQLList(GraphQLJSON),
    args: {
      values: {
        type: new graphql.GraphQLNonNull(new graphql.GraphQLList(GraphQLJSON)),
      },
    },
    resolve(doc: any, {values}: {values: Array<ChannelValueUpdate>}, context: Context): Array<ChannelState> {
      const {scopes} = context
      if (!scopes || scopes.indexOf('test:update:channelStates') < 0) {
        throw new graphql.GraphQLError('Forbidden')
      }

      store.dispatch(setChannelValues(...values))

      return values.map(({channelId}) => store.getChannelState(channelId))
    },
  }
}

