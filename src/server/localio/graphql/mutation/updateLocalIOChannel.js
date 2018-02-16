// @flow

import * as graphql from 'graphql'
import LocalIOChannel from '../../models/LocalIOChannel'
import JSONType from 'graphql-type-json'
import type {Context} from '../../../graphql/Context'
import type {LocalIOChannelAttributes} from '../../models/LocalIOChannel'

export default function updateLocalIOChannel({types, inputTypes}: {
  types: {[name: string]: graphql.GraphQLOutputType},
  inputTypes: {[name: string]: graphql.GraphQLInputType},
}): graphql.GraphQLFieldConfig<any, Context> {
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
    resolve: async (doc: any, {id, where, channel}: {id: ?number, where: ?Object, channel: $Shape<LocalIOChannelAttributes>}, context: Context): Promise<any> => {
      const {userId} = context
      if (!userId) throw new graphql.GraphQLError('You must be logged in to update LocalIOChannels')
      if (!where) where = {id: id != null ? id : channel.id}

      const {
        createdAt, updatedAt, // eslint-disable-line no-unused-vars
        ...updates
      } = channel
      await LocalIOChannel.update(updates, {where, individualHooks: true})
      const result = await LocalIOChannel.findOne({where})
      if (!result) throw new graphql.GraphQLError('Failed to find updated LocalIOChannel')
      return result.get({plain: true, raw: true})
    },
  }
}
