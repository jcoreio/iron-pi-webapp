// @flow

import JSONType from 'graphql-type-json'
import type {Context} from '../Context'
import * as graphql from 'graphql'
import type {MetadataItem as Item} from '../../../universal/types/MetadataItem'
import MetadataItem from '../../models/MetadataItem'

export default function updateMetadataItem({types}: {
  types: {[name: string]: graphql.GraphQLOutputType},
}): graphql.GraphQLFieldConfig<any, Context> {
  return {
    type: types[MetadataItem.options.name.singular],
    args: {
      tag: {
        type: graphql.GraphQLString,
        description: 'The tag of the metadata item to update',
      },
      where: {
        type: JSONType,
        description: 'The sequelize where options',
      },
      metadataItem: {
        type: JSONType,
        description: 'The new metadata item',
      }
    },
    resolve: async (doc: any, {tag, where, metadataItem}: {tag: ?string, where: ?Object, metadataItem: Item}, context: Context): Promise<any> => {
      const {userId} = context
      if (!userId) throw new graphql.GraphQLError('You must be logged in to update MetadataItems')
      if (!where) {
        if (!tag) throw new Error('where or tag must be defined')
        where = {tag}
      }

      await MetadataItem.update({item: metadataItem}, {where, individualHooks: true})
      const result = await MetadataItem.findOne({where})
      if (!result) throw new graphql.GraphQLError('Failed to find updated MetadataItem')
      return result.get({plain: true, raw: true})
    },
  }
}

