// @flow

import * as graphql from 'graphql'
import MQTTChannelConfig from '../../models/MQTTChannelConfig'
import type {MQTTChannelConfigAttributes} from '../../models/MQTTChannelConfig'
import type {GraphQLContext} from '../../../graphql/Context'
import {defaultUpdateTypeName} from '../../../graphql/types/defaultUpdateType'
import JSONType from 'graphql-type-json'

export default function updateMQTTChannelConfig({types, inputTypes}: {
  types: {[name: string]: graphql.GraphQLOutputType},
  inputTypes: {[name: string]: graphql.GraphQLInputType},
}): graphql.GraphQLFieldConfig<any, GraphQLContext> {
  return {
    type: types[MQTTChannelConfig.options.name.singular],
    args: {
      id: {
        type: graphql.GraphQLInt,
        description: 'The id of the channel channelConfig to update',
      },
      where: {
        type: JSONType,
        description: 'The sequelize where options',
      },
      channelConfig: {
        type: inputTypes[defaultUpdateTypeName(MQTTChannelConfig)],
        description: 'The fields to update',
      },
    },
    resolve: async (
      doc: any,
      {id, where, channelConfig}: {id: ?number, where: ?Object, channelConfig: $Shape<MQTTChannelConfigAttributes>},
      context: GraphQLContext
    ): Promise<?MQTTChannelConfig> => {
      const {userId} = context
      if (!userId) throw new graphql.GraphQLError('You must be logged in to update MQTTChannelConfigs')
      if (!where) {
        if (id == null) id = channelConfig.id
        if (id === null) throw new Error('Missing id or where options')
        where = {id}
      }
      await MQTTChannelConfig.update(channelConfig, {where, individualHooks: true})
      return await MQTTChannelConfig.findOne({where})
    },
  }
}

