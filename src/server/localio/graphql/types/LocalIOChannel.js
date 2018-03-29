// @flow

import {attributeFields} from 'graphql-sequelize'
import {LocalIOChannelMode, LocalIOChannelState as GraphQLLocalIOChannelState} from './LocalIOChannelState'
import type {ChannelMode, LocalIOChannelState} from '../../../../universal/localio/LocalIOChannel'
import LocalIOChannel from '../../models/LocalIOChannel'
import type {GraphQLContext} from '../../../graphql/GraphQLContext'
import * as graphql from 'graphql'
import MetadataItem from '../../../graphql/types/MetadataItem'
import getChannelState from '../../getChannelState'
import {LocalIOFeature} from '../../LocalIOFeature'

export default function createLocalIOChannel(options: {
  feature: LocalIOFeature,
  attributeFieldsCache: Object,
}): graphql.GraphQLObjectType {
  const {feature, attributeFieldsCache} = options
  return new graphql.GraphQLObjectType({
    name: LocalIOChannel.options.name.singular,
    fields: () => ({
      ...attributeFields(LocalIOChannel, {cache: attributeFieldsCache}),
      metadataItem: {
        type: MetadataItem,
        description: 'the metadata item for this channel',
        resolve: ({tag}: LocalIOChannel, args: any, {metadataHandler}: GraphQLContext) => {
          if (tag) {
            const item = metadataHandler.getTagMetadata(tag)
            return item ? {...item, tag} : null
          }
        },
      },
      name: {
        type: graphql.GraphQLString,
        description: 'the name for this channel',
        resolve: ({id, tag, config}: LocalIOChannel, args: any, {metadataHandler}: GraphQLContext) => {
          if (config.mode === 'DISABLED' && config.name) return config.name
          if (!tag) return config.name || `Channel ${id + 1}`
          const item = metadataHandler.getTagMetadata(tag)
          return item && item.name || `Channel ${id + 1}`
        },
      },
      state: {
        type: GraphQLLocalIOChannelState,
        description: 'the current state of this channel',
        resolve: (channel: LocalIOChannel, args: any, {dataRouter}: GraphQLContext): ?LocalIOChannelState => {
          return getChannelState(channel, {
            getTagValue: tag => dataRouter.getTagValue(tag),
          })
        }
      },
      supportedModes: {
        type: new graphql.GraphQLList(LocalIOChannelMode),
        description: 'the supported moes for this channel',
        resolve: ({id}: LocalIOChannel): Array<ChannelMode> => {
          if (feature.plugin.channelSupportsAnalog(id)) {
            return ['ANALOG_INPUT', 'DIGITAL_INPUT', 'DIGITAL_OUTPUT', 'DISABLED']
          }
          return ['DIGITAL_INPUT', 'DIGITAL_OUTPUT', 'DISABLED']
        },
      },
    }),
  })
}
