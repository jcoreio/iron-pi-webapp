// @flow

import type {Model} from 'sequelize'
import * as graphql from 'graphql'
import MQTTChannelConfig from '../../models/MQTTChannelConfig'
import {attributeFields} from 'graphql-sequelize'
import {associationFields} from '@jcoreio/graphql-sequelize-extra/lib/index'
import type {GraphQLContext} from '../../../graphql/Context'
import MetadataItem from '../../../graphql/types/MetadataItem'
import JSONType from 'graphql-type-json'

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
      metadataItem: {
        type: MetadataItem,
        description: 'the metadata item for this channel',
        resolve: ({internalTag}: MQTTChannelConfig, args: any, {metadataHandler}: GraphQLContext) => {
          const item = metadataHandler.getTagMetadata(internalTag)
          return item ? {...item, tag: internalTag} : null
        },
      },
      systemValue: {
        type: JSONType,
        description: 'the current system value for this channel',
        resolve: ({internalTag}: MQTTChannelConfig, args: any, {dataRouter}: GraphQLContext) => {
          return dataRouter.getTagValue(internalTag)
        },
      },
    })
  })
}

