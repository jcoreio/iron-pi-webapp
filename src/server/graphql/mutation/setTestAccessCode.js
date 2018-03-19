// @flow

import * as graphql from 'graphql'
import type {GraphQLContext} from '../GraphQLContext'

function verifyAccessCode(): graphql.GraphQLFieldConfig<any, GraphQLContext> {
  return {
    type: graphql.GraphQLBoolean,
    args: {
      accessCode: {
        type: new graphql.GraphQLNonNull(graphql.GraphQLString),
      },
    },
    resolve: async (obj: any, {accessCode}: {accessCode: string}, {accessCodeHandler}: GraphQLContext): Promise<void> => {
      accessCodeHandler.setTestAccessCode(accessCode)
    }
  }
}
module.exports = verifyAccessCode

