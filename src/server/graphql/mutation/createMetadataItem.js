// @flow

import type {GraphQLContext} from '../Context'
import * as graphql from 'graphql'
import type {MetadataItem} from '../../../universal/types/MetadataItem'
import SequelizeMetadataItem from '../../models/MetadataItem'
import GraphQLMetadataItem from '../types/MetadataItem'
import InputMetadataItem from '../types/InputMetadataItem'

export default function createMetadataItem(): graphql.GraphQLFieldConfig<any, GraphQLContext> {
  return {
    type: GraphQLMetadataItem,
    args: {
      item: {
        type: InputMetadataItem,
        description: 'The new metadata item',
      },
    },
    resolve: async (doc: any, {item}: {item: MetadataItem}, context: GraphQLContext): Promise<MetadataItem> => {
      const {userId} = context
      if (!userId) throw new graphql.GraphQLError('You must be logged in to create MetadataItems')

      const {tag} = item
      const result = await SequelizeMetadataItem.create({tag, item})
      return result.get({raw: true, plain: true}).item
    },
  }
}

