// @flow

import * as graphql from 'graphql'
import type {Context} from './Context'

export default function requireUserId<F: Object>(
  findOptions: F,
  args: any,
  context: Context,
  {fieldName}: {fieldName: string}
): F {
  const {userId} = context
  if (!userId) throw new graphql.GraphQLError(`You must be logged in to access ${fieldName}`)
  return findOptions
}

