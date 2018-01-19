// @flow

import type {GraphQLFieldConfig} from 'graphql'
import * as graphql from 'graphql'
import type {Context} from '../Context'
import GraphQLJSON from 'graphql-type-json'
import {setChannelValues} from '../../localio/ChannelStates'
import type {ChannelState} from '../../../universal/types/Channel'

type Options = {
}

type Args = {
  channelId: number,
  rawInput?: number,
  controlValue?: number,
}

export default function createSetChannelValue(options: Options): GraphQLFieldConfig<any, Context> {
  return {
    type: GraphQLJSON,
    args: {
      channelId: {
        type: new graphql.GraphQLNonNull(graphql.GraphQLInt),
        description: 'The numeric id of the channel to change the value of'
      },
      rawInput: {
        type: graphql.GraphQLFloat,
        description: 'The raw value if the channel is an input'
      },
      controlValue: {
        type: graphql.GraphQLInt,
        description: 'The control value if the channel is an output'
      },
    },
    resolve(doc: any, args: Args, context: Context): Array<ChannelState> {
      const {scopes} = context
      if (!scopes || scopes.indexOf('test:update:channelStates') < 0) {
        throw new graphql.GraphQLError('Forbidden')
      }

      let newValue
      if (args.hasOwnProperty('rawInput')) {
        const {channelId, rawInput} = args
        newValue = {id: channelId, rawInput}
      } else if (args.hasOwnProperty('controlValue')) {
        const {channelId, controlValue} = args
        newValue = {id: channelId, controlValue}
      } else {
        throw new Error('must provide rawInput or controlValue')
      }

      return setChannelValues((newValue: Object))
    },
  }
}

