// @flow

import type {GraphQLFieldConfig} from 'graphql'
import * as graphql from 'graphql'
import type {GraphQLContext} from '../GraphQLContext'
import TagState from '../types/TagState'

export default function createTagState(): GraphQLFieldConfig<any, GraphQLContext> {
  return {
    type: TagState,
    description: 'Gets the state of a single tag',
    args: {
      tag: {
        type: new graphql.GraphQLNonNull(graphql.GraphQLString),
        description: 'The tag to get the state of',
      },
    },
    resolve(doc: any, {tag}: {tag: string}, context: GraphQLContext): any {
      const {userId, dataRouter} = context
      if (!userId) throw new graphql.GraphQLError('You must be logged in to subscribe to tag states')
      const state = dataRouter.tagMap()[tag]
      if (!state) return null
      const {t, v} = state
      return {tag, t, v}
    }
  }
}

