// @flow

import type {GraphQLFieldConfig, GraphQLOutputType, GraphQLInputType} from 'graphql'
import * as graphql from 'graphql'
import type {Context} from '../Context'
import Channel from '../../models/Channel'
import type {ChannelAttributes} from '../../models/Channel'

type Options = {
  types: {[name: string]: GraphQLOutputType},
  inputTypes: {[name: string]: GraphQLInputType},
}

export default function updateChannel({types, inputTypes}: Options): GraphQLFieldConfig<any, Context> {
  return {
    type: types[Channel.name],
    args: {
      channel: {
        type: inputTypes[Channel.name],
      }
    },
    resolve: async (doc: any, {channel}: {channel: $Shape<ChannelAttributes>}, context: Context): Promise<any> => {
      const {userId} = context
      if (!userId) throw new graphql.GraphQLError('You must be logged in to update Channels')

      const {
        id,
        createdAt, updatedAt, // eslint-disable-line no-unused-vars
        ...updates
      } = channel
      await Channel.update(updates, {where: {id}, individualHooks: true})
      const result = await Channel.findOne({where: {id}})
      if (!result) throw new graphql.GraphQLError('Failed to find updated Channel')
      return result.get({plain: true, raw: true})
    },
  }
}

