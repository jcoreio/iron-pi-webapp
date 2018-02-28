// @flow

import * as graphql from 'graphql'
import MQTTConfig from '../../models/MQTTConfig'
import type {MQTTConfigInitAttributes} from '../../models/MQTTConfig'
import type {GraphQLContext} from '../../../graphql/Context'
import {defaultCreateTypeName} from '../../../graphql/types/defaultCreateType'

export default function createMQTTConfig({types, inputTypes}: {
  types: {[name: string]: graphql.GraphQLOutputType},
  inputTypes: {[name: string]: graphql.GraphQLInputType},
}): graphql.GraphQLFieldConfig<any, GraphQLContext> {
  return {
    type: types[MQTTConfig.options.name.singular],
    args: {
      config: {
        type: inputTypes[defaultCreateTypeName(MQTTConfig)],
        description: 'The config to create',
      }
    },
    resolve: async (doc: any, {config}: {config: MQTTConfigInitAttributes}, context: GraphQLContext): Promise<MQTTConfig> => {
      const {userId} = context
      if (!userId) throw new graphql.GraphQLError('You must be logged in to create MQTTConfigs')
      return await MQTTConfig.create(config)
    },
  }
}
