// @flow

import type {GraphQLContext} from '../Context'
import * as graphql from 'graphql'
import type {MetadataItem} from '../../../universal/types/MetadataItem'
import SequelizeMetadataItem from '../../models/MetadataItem'
import GraphQLMetadataItem from '../types/MetadataItem'
import InputMetadataItem from '../types/InputMetadataItem'

export default function updateMetadataItem(): graphql.GraphQLFieldConfig<any, GraphQLContext> {
  return {
    type: GraphQLMetadataItem,
    args: {
      item: {
        type: InputMetadataItem,
        description: 'The new metadata item',
      }
    },
    resolve: async (doc: any, {item}: {item: MetadataItem}, context: GraphQLContext): Promise<any> => {
      const {userId} = context
      if (!userId) throw new graphql.GraphQLError('You must be logged in to update MetadataItems')

      const {tag} = item
      const where = {tag}
      await SequelizeMetadataItem.update({item}, {where, individualHooks: true})
      const result = await SequelizeMetadataItem.findOne({where})
      if (!result) throw new graphql.GraphQLError('Failed to find updated MetadataItem')
      return result.get({raw: true, plain: true}).item
    },
  }
}

