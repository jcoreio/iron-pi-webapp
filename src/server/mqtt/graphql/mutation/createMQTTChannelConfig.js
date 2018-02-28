// @flow

import * as graphql from 'graphql'
import MQTTChannelConfig from '../../models/MQTTChannelConfig'
import type {MQTTChannelConfigInitAttributes} from '../../models/MQTTChannelConfig'
import type {GraphQLContext} from '../../../graphql/Context'
import {defaultCreateTypeName} from '../../../graphql/types/defaultCreateType'

export default function createMQTTChannelConfig({types, inputTypes}: {
  types: {[name: string]: graphql.GraphQLOutputType},
  inputTypes: {[name: string]: graphql.GraphQLInputType},
}): graphql.GraphQLFieldConfig<any, GraphQLContext> {
  return {
    type: types[MQTTChannelConfig.options.name.singular],
    args: {
      channelConfig: {
        type: inputTypes[defaultCreateTypeName(MQTTChannelConfig)],
        description: 'The channel config to create',
      }
    },
    resolve: async (doc: any, {channelConfig}: {channelConfig: MQTTChannelConfigInitAttributes}, context: GraphQLContext): Promise<MQTTChannelConfig> => {
      const {userId} = context
      if (!userId) throw new graphql.GraphQLError('You must be logged in to create MQTTChannelConfigs')
      return await MQTTChannelConfig.create(channelConfig)
    },
  }
}
