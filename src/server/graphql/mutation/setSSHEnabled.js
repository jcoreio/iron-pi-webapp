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
    resolve: async (obj: any, {sshEnabled}: {sshEnabled: boolean}, {sshHandler}: GraphQLContext): Promise<any> => {
      await sshHandler.setSSHEnabled(!!sshEnabled)
      return await sshHandler.isSSHEnabled()
    }
  }
}
