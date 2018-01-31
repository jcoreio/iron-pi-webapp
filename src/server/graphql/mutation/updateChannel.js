// @flow

import type {GraphQLFieldConfig, GraphQLOutputType, GraphQLInputType} from 'graphql'
import * as graphql from 'graphql'
import type {Context} from '../Context'
import Channel from '../../models/Channel'
import type {ChannelAttributes} from '../../models/Channel'
import JSONType from 'graphql-type-json'

type Options = {
  types: {[name: string]: GraphQLOutputType},
  inputTypes: {[name: string]: GraphQLInputType},
}

export default function updateChannel({types, inputTypes}: Options): GraphQLFieldConfig<any, Context> {
  return {
    type: types[Channel.name],
    args: {
      id: {
        type: graphql.GraphQLString,
        description: 'The id of the channel to update',
      },
      where: {
        type: JSONType,
        description: 'The sequelize where options',
      },
      channel: {
        type: inputTypes[Channel.name],
        description: 'The fields to update',
      }
    },
    resolve: async (doc: any, {id, where, channel}: {id: ?string, where: ?Object, channel: $Shape<ChannelAttributes>}, context: Context): Promise<any> => {
      const {userId} = context
      if (!userId) throw new graphql.GraphQLError('You must be logged in to update Channels')
      if (!where) where = {id: id || channel.id}

      const {
        createdAt, updatedAt, // eslint-disable-line no-unused-vars
        ...updates
      } = channel
      await Channel.update(updates, {where, individualHooks: true})
      const result = await Channel.findOne({where: updates.id ? {id: updates.id} : where})
      if (!result) throw new graphql.GraphQLError('Failed to find updated Channel')
      return result.get({plain: true, raw: true})
    },
  }
}

