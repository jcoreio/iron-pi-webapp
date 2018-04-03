// @flow

import * as graphql from 'graphql'
import type {GraphQLContext} from '../GraphQLContext'

export default function createSetSSHEnabled(): graphql.GraphQLFieldConfig<any, GraphQLContext> {
  return {
    type: graphql.GraphQLBoolean,
    args: {
      sshEnabled: {
        type: new graphql.GraphQLNonNull(graphql.GraphQLBoolean)
      },
    },
    resolve: async (obj: any, {sshEnabled}: {sshEnabled: boolean}, {userId, sshHandler}: GraphQLContext): Promise<any> => {
      if (!userId) throw new Error('You must be logged in to turn SSH on or off')
      await sshHandler.setSSHEnabled(!!sshEnabled)
      return await sshHandler.isSSHEnabled()
    }
  }
}
