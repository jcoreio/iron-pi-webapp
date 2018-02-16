// @flow

import JSONType from 'graphql-type-json'
import type {Context} from '../Context'
import * as graphql from 'graphql'
import type {MetadataItem as Item} from '../../../universal/types/MetadataItem'
import MetadataItem from '../../models/MetadataItem'

export default function createMetadataItem({types}: {
  types: {[name: string]: graphql.GraphQLOutputType},
}): graphql.GraphQLFieldConfig<any, Context> {
  return {
    type: types[MetadataItem.options.name.singular],
    args: {
      tag: {
        type: new graphql.GraphQLNonNull(graphql.GraphQLString),
        description: 'The tag of the metadata item to create',
      },
      metadataItem: {
        type: JSONType,
        description: 'The new metadata item',
      },
    },
    resolve: async (doc: any, {tag, metadataItem}: {tag: string, metadataItem: Item}, context: Context): Promise<MetadataItem> => {
      const {userId} = context
      if (!userId) throw new graphql.GraphQLError('You must be logged in to create MetadataItems')

      const result = await MetadataItem.create({tag, item: metadataItem})
      return result
    },
  }
}

