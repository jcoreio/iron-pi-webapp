// @flow

import * as graphql from 'graphql'
import type {GraphQLContext} from '../GraphQLContext'

export default function verifyAccessCode(): graphql.GraphQLFieldConfig<any, GraphQLContext> {
  return {
    type: graphql.GraphQLBoolean,
    args: {
      accessCode: {
        type: new graphql.GraphQLNonNull(graphql.GraphQLString),
      },
    },
    resolve: async (obj: any, {accessCode}: {accessCode: string}, {accessCodeHandler}: GraphQLContext): Promise<void> => {
      try {
        await accessCodeHandler.verifyAccessCode(accessCode)
      } catch (err) {
        const {message} = err
        const error = new Error(message);
        (error: any).validation = {
          errors: [{path: ['accessCode'], message}]
        }
        throw error
      }
    }
  }
}
