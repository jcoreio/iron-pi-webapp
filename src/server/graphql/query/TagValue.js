// @flow

import type {GraphQLFieldConfig} from 'graphql'
import * as graphql from 'graphql'
import type {GraphQLContext} from '../Context'
import JSONType from 'graphql-type-json'

export default function createTagValue(): GraphQLFieldConfig<any, GraphQLContext> {
  return {
    type: JSONType,
    description: 'Gets the value of a single tag',
    args: {
      tag: {
        type: new graphql.GraphQLNonNull(graphql.GraphQLString),
        description: 'The tag to get the value of',
      },
    },
    resolve(doc: any, {tag}: {tag: string}, context: GraphQLContext): any {
      const {userId, dataRouter} = context
      if (!userId) throw new graphql.GraphQLError('You must be logged in to subscribe to tag values')
      return dataRouter.getTagValue(tag)
    }
  }
}

