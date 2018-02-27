// @flow

import * as graphql from 'graphql'
import LocalIOChannel from '../../models/LocalIOChannel'
import type {LocalIOChannelConfig} from '../../../../universal/localio/LocalIOChannel'
import type {MetadataItem} from '../../../../universal/types/MetadataItem'
import SequelizeMetadataItem from '../../../models/MetadataItem'
import JSONType from 'graphql-type-json'
import type {GraphQLContext} from '../../../graphql/Context'

type InputChannel = {
  id?: number,
  tag?: string,
  config?: LocalIOChannelConfig,
  metadataItem?: MetadataItem,
}

export default function updateLocalIOChannel({types, inputTypes}: {
  types: {[name: string]: graphql.GraphQLOutputType},
  inputTypes: {[name: string]: graphql.GraphQLInputType},
}): graphql.GraphQLFieldConfig<any, GraphQLContext> {
  return {
    type: types[LocalIOChannel.options.name.singular],
    args: {
      id: {
        type: graphql.GraphQLInt,
        description: 'The id of the channel to update',
      },
      where: {
        type: JSONType,
        description: 'The sequelize where options',
      },
      channel: {
        type: inputTypes[LocalIOChannel.options.name.singular],
        description: 'The fields to update',
      }
    },
    resolve: async (doc: any, {id, where, channel}: {id: ?number, where: ?Object, channel: InputChannel}, context: GraphQLContext): Promise<any> => {
      const {userId} = context
      if (!userId) throw new graphql.GraphQLError('You must be logged in to update LocalIOChannels')
      if (!where) {
        if (id != null) where = {id}
        else if (channel.id) where = {id: channel.id}
        else throw new Error('id or channel.id must be provided')
      }

      const {metadataItem, ...updates} = channel

      if (metadataItem) {
        const {tag} = metadataItem
        updates.tag = tag
        const [numUpdated] = await SequelizeMetadataItem.update({item: metadataItem}, {where: {tag}, individualHooks: true})
        if (!numUpdated) await SequelizeMetadataItem.create({tag, item: metadataItem})
      }

      await LocalIOChannel.update(updates, {where, individualHooks: true})
      const result = await LocalIOChannel.findOne({where})
      if (!result) throw new graphql.GraphQLError('Failed to find updated LocalIOChannel')
      return result.get({plain: true, raw: true})
    },
  }
}
