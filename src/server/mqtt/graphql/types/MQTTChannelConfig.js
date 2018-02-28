// @flow

import type {Model} from 'sequelize'
import * as graphql from 'graphql'
import MQTTChannelConfig from '../../models/MQTTChannelConfig'
import {attributeFields} from 'graphql-sequelize'
import {associationFields} from '@jcoreio/graphql-sequelize-extra/lib/index'

type Options = {
  getType: (model: Class<Model<any>>) => graphql.GraphQLOutputType,
  getArgs: (model: Class<Model<any>>) => graphql.GraphQLFieldConfigArgumentMap,
  attributeFieldsCache: Object,
}

export default function createMQTTChannelConfig({
  getType,
  getArgs,
  attributeFieldsCache,
}: Options): graphql.GraphQLObjectType {
  return new graphql.GraphQLObjectType({
    name: MQTTChannelConfig.options.name.singular,
    fields: () => ({
      ...attributeFields(MQTTChannelConfig, {cache: attributeFieldsCache}),
      // $FlowFixMe
      ...associationFields(MQTTChannelConfig, {getType, getArgs}),
    })
  })
}

