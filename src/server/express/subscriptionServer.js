// @flow

import {execute, subscribe} from 'graphql'
import type {GraphQLSchema} from 'graphql'
import {SubscriptionServer} from "subscriptions-transport-ws"
import verifyToken from '../auth/verifyToken'

export default function createSubscriptionServer(options: {
  schema: GraphQLSchema,
  server: net$Server,
  path: string,
}): SubscriptionServer {
  const {schema, ...serverOptions} = options
  return SubscriptionServer.create(
    {
      schema,
      execute,
      subscribe,
      onConnect: async ({token}: {token?: string}) => {
        if (!token) {
          const error = new Error('missing authorization token')
          ;(error: any).statusCode = 400
          throw error
        }
        const {userId, scopes} = await verifyToken(token)
        return {userId, scopes}
      }
    },
    serverOptions
  )
}

