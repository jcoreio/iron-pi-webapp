// @flow

import {execute, subscribe} from 'graphql'
import type {GraphQLSchema} from 'graphql'
import {SubscriptionServer} from "subscriptions-transport-ws"
import verifyToken from '../auth/verifyToken'
import type {GraphQLContext, GraphQLDependencies} from '../graphql/GraphQLContext'

export default function createSubscriptionServer(options: {
  schema: GraphQLSchema,
  server: net$Server,
  path: string,
  dependencies: GraphQLDependencies,
}): SubscriptionServer {
  const {
    schema,
    dependencies,
    ...serverOptions
  } = options

  return SubscriptionServer.create(
    {
      schema,
      execute,
      subscribe,
      onConnect: async ({token}: { token?: string }): Promise<GraphQLContext> => {
        const {userId, scopes} = token ? await verifyToken(token) : {userId: null, scopes: new Set()}
        return {userId, scopes, ...dependencies}
      },
      onOperation: async (connectionParams: {payload: {token?: string}}, operationParams: {context: GraphQLContext}): Promise<{context: GraphQLContext}> => {
        const {payload: {token}} = connectionParams
        if ((token != null) === (operationParams.context.userId != null)) return operationParams
        const {userId, scopes} = token ? await verifyToken(token) : {userId: null, scopes: new Set()}
        return {
          ...operationParams,
          context: {
            ...operationParams.context,
            userId, scopes
          }
        }
      },
    },
    serverOptions
  )
}

