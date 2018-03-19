// @flow

import {execute, subscribe} from 'graphql'
import type {GraphQLSchema} from 'graphql'
import {SubscriptionServer} from "subscriptions-transport-ws"
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
      onConnect: async (): Promise<GraphQLContext> => {
        return {...dependencies}
      },
    },
    serverOptions
  )
}

