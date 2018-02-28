// @flow

import * as graphql from 'graphql'
import JSONType from 'graphql-type-json'
import MQTTConfig from '../../models/MQTTConfig'
import type {GraphQLContext} from '../../../graphql/Context'

export default function destroyMQTTConfig({types, inputTypes}: {
  types: {[name: string]: graphql.GraphQLOutputType},
  inputTypes: {[name: string]: graphql.GraphQLInputType},
}): graphql.GraphQLFieldConfig<any, GraphQLContext> {
  return {
    type: new graphql.GraphQLNonNull(graphql.GraphQLInt),
    args: {
      id: {
        type: graphql.GraphQLInt,
        description: 'The id of the MQTTConfig to destroy',
      },
      where: {
        type: JSONType,
        description: 'The sequelize where options',
      }
    },
    resolve: async (doc: any, {id, where}: {id: ?number, where: ?Object}, context: GraphQLContext): Promise<MQTTConfig> => {
      const {userId} = context
      if (!userId) throw new graphql.GraphQLError('You must be logged in to destroy MQTTConfigs')
      if (!where) {
        if (id == null) throw new Error("id or where must be provided")
        where = {id}
      } else if (id != null) {
        where.id = id
      }
      return await MQTTConfig.destroy({where, individualHooks: true})
    },
  }
}

