// @flow

import type {Model} from 'sequelize'
import * as graphql from 'graphql'
import MQTTConfig from '../../models/MQTTConfig'
import type MQTTFeature from '../../MQTTFeature'
import {attributeFields} from 'graphql-sequelize'
import {associationFields} from '@jcoreio/graphql-sequelize-extra/lib/index'
import {MQTTPluginState} from './MQTTPluginState'

type Options = {
  getType: (model: Class<Model<any>>) => graphql.GraphQLOutputType,
  getArgs: (model: Class<Model<any>>) => graphql.GraphQLFieldConfigArgumentMap,
  attributeFieldsCache: Object,
  feature: MQTTFeature,
}

export default function createMQTTConfig({
  getType,
  getArgs,
  attributeFieldsCache,
  feature,
}: Options): graphql.GraphQLObjectType {
  return new graphql.GraphQLObjectType({
    name: MQTTConfig.options.name.singular,
    fields: () => ({
      ...attributeFields(MQTTConfig, {cache: attributeFieldsCache}),
      // $FlowFixMe
      ...associationFields(MQTTConfig, {getType, getArgs}),
      state: {
        type: new graphql.GraphQLNonNull(MQTTPluginState),
        resolve: (config: MQTTConfig) => {
          const plugin = feature.getDataPlugin(config.id)
          if (!plugin) throw new Error(`MQTTPlugin not found for id: ${config.id}`)
          return plugin.getState()
        }
      }
    })
  })
}

