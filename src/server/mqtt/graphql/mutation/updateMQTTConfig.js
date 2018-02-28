// @flow

import * as graphql from 'graphql'
import MQTTConfig from '../../models/MQTTConfig'
import type {MQTTConfigAttributes} from '../../models/MQTTConfig'
import type {GraphQLContext} from '../../../graphql/Context'
import {defaultUpdateTypeName} from '../../../graphql/types/defaultUpdateType'
import JSONType from 'graphql-type-json'

export default function updateMQTTConfig({types, inputTypes}: {
  types: {[name: string]: graphql.GraphQLOutputType},
  inputTypes: {[name: string]: graphql.GraphQLInputType},
}): graphql.GraphQLFieldConfig<any, GraphQLContext> {
  return {
    type: types[MQTTConfig.options.name.singular],
    args: {
      id: {
        type: graphql.GraphQLInt,
        description: 'The id of the values to update',
      },
      where: {
        type: JSONType,
        description: 'The sequelize where options',
      },
      values: {
        type: inputTypes[defaultUpdateTypeName(MQTTConfig)],
        description: 'The attribute values to update',
      },
    },
    resolve: async (
      doc: any,
      {id, where, values}: {id: ?number, where: ?Object, values: $Shape<MQTTConfigAttributes>},
      context: GraphQLContext
    ): Promise<?MQTTConfig> => {
      const {userId} = context
      if (!userId) throw new graphql.GraphQLError('You must be logged in to update MQTTConfigs')
      if (!where) {
        if (id == null) id = values.id
        if (id === null) throw new Error('Missing id or where options')
        where = {id}
      }
      await MQTTConfig.update(values, {where, individualHooks: true})
      return await MQTTConfig.findOne({where})
    },
  }
}

