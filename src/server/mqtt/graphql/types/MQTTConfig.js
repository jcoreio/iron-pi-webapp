// @flow

import type {Model} from 'sequelize'
import * as graphql from 'graphql'
import MQTTConfig from '../../models/MQTTConfig'
import {attributeFields} from 'graphql-sequelize'
import {associationFields} from '@jcoreio/graphql-sequelize-extra/lib/index'

type Options = {
  getType: (model: Class<Model<any>>) => graphql.GraphQLOutputType,
  getArgs: (model: Class<Model<any>>) => graphql.GraphQLFieldConfigArgumentMap,
  attributeFieldsCache: Object,
}

export default function createMQTTConfig({
  getType,
  getArgs,
  attributeFieldsCache,
}: Options): graphql.GraphQLObjectType {
  return new graphql.GraphQLObjectType({
    name: MQTTConfig.options.name.singular,
    fields: () => ({
      ...attributeFields(MQTTConfig, {cache: attributeFieldsCache}),
      // $FlowFixMe
      ...associationFields(MQTTConfig, {getType, getArgs}),
    })
  })
}

