// @flow

import * as graphql from 'graphql'
import type {GraphQLContext} from './Context'

export default function requireUserId<F: Object>(
  findOptions: F,
  args: any,
  context: GraphQLContext,
  {fieldName}: {fieldName: string}
): F {
  const {userId} = context
  if (!userId) throw new graphql.GraphQLError(`You must be logged in to access ${fieldName}`)
  return findOptions
}

