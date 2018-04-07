// @flow

import type {Model} from 'sequelize'
import * as graphql from 'graphql'
import MQTTChannelConfig from '../../models/MQTTChannelConfig'
import {attributeFields} from 'graphql-sequelize'
import {associationFields} from '@jcoreio/graphql-sequelize-extra/lib/index'
import type {GraphQLContext} from '../../../graphql/GraphQLContext'
import MetadataItem from '../../../graphql/types/MetadataItem'
import JSONType from 'graphql-type-json'
import {TO_MQTT} from '../../models/MQTTChannelConfig'
import TagState from '../../../graphql/types/TagState'
import * as MQTTTags from '../../../../universal/mqtt/MQTTTags'

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
      internalTagState: {
        type: TagState,
        description: "the current state for this channel's internalTag",
        resolve: ({internalTag}: MQTTChannelConfig, args: any, {dataRouter}: GraphQLContext) => {
          return dataRouter.getTagState(internalTag)
        },
      },
      mqttTagState: {
        type: TagState,
        description: "the current state for this channel's mqttTag",
        resolve: ({configId, direction, mqttTag}: MQTTChannelConfig, args: any, {dataRouter}: GraphQLContext) => {
          return dataRouter.getTagState(TO_MQTT === direction ?
            MQTTTags.toMQTTValue(configId, mqttTag) : MQTTTags.fromMQTTValue(configId, mqttTag))
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

