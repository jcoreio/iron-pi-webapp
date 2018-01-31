// @flow

import type {GraphQLFieldConfig} from 'graphql'
import * as graphql from 'graphql'
import type {Context} from '../Context'
import GraphQLJSON from 'graphql-type-json'
import type {ChannelState} from '../../../universal/types/Channel'
import type {Store} from '../../redux/types'
import {setChannelValues} from '../../redux'

type Options = {
  store: Store,
}

type Args = {
  channelId: string,
  rawAnalogInput?: number,
  rawDigitalInput?: number,
  controlValue?: number,
}

export default function createSetChannelValue({store}: Options): GraphQLFieldConfig<any, Context> {
  return {
    type: GraphQLJSON,
    args: {
      channelId: {
        type: new graphql.GraphQLNonNull(graphql.GraphQLString),
        description: 'The id of the channel to change the value of'
      },
      rawAnalogInput: {
        type: graphql.GraphQLFloat,
        description: 'The raw value if the channel is an analog input'
      },
      rawDigitalInput: {
        type: graphql.GraphQLInt,
        description: 'The raw value if the channel is a digital input'
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

      const {channelId} = args

      if (args.hasOwnProperty('rawAnalogInput')) {
        const {rawAnalogInput} = args
        if (rawAnalogInput === undefined) throw new Error('Unexpected: rawAnalogInput is undefined')
        store.dispatch(setChannelValues({channelId, value: {rawAnalogInput}}))
      } else if (args.hasOwnProperty('rawDigitalInput')) {
        const {rawDigitalInput} = args
        if (rawDigitalInput !== 0 && rawDigitalInput !== 1 && rawDigitalInput !== null) {
          throw new Error('rawDigitalInput must be 0, 1, or null')
        }
        store.dispatch(setChannelValues({channelId, value: {rawDigitalInput}}))
      } else if (args.hasOwnProperty('controlValue')) {
        const {controlValue} = args
        if (controlValue !== 0 && controlValue !== 1 && controlValue !== null) {
          throw new Error('controlValue must be 0, 1, or null')
        }
        store.dispatch(setChannelValues({channelId, value: {controlValue}}))
      } else {
        throw new Error('must provide rawAnalogInput, rawDigitalInput, or controlValue')
      }

      return store.getChannelState(channelId)
    },
  }
}

