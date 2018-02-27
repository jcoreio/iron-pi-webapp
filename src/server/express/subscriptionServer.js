// @flow

import {execute, subscribe} from 'graphql'
import type {GraphQLSchema} from 'graphql'
import {SubscriptionServer} from "subscriptions-transport-ws"
import verifyToken from '../auth/verifyToken'
import type DataRouter from '../data-router/DataRouter'
import {PubSubEngine} from "graphql-subscriptions"
import type Sequelize from 'sequelize'
import type MetadataHandler from '../metadata/MetadataHandler'
import type {Context} from '../graphql/Context'

export default function createSubscriptionServer(options: {
  schema: GraphQLSchema,
  server: net$Server,
  path: string,
  sequelize: Sequelize,
  dataRouter: DataRouter,
  metadataHandler: MetadataHandler,
  pubsub: PubSubEngine,
}): SubscriptionServer {
  const {
    schema,
    sequelize,
    dataRouter,
    metadataHandler,
    pubsub,
    ...serverOptions
  } = options

  return SubscriptionServer.create(
    {
      schema,
      execute,
      subscribe,
      onConnect: async ({token}: { token?: string }): Promise<Context> => {
        const {userId, scopes} = token ? await verifyToken(token) : {userId: null, scopes: new Set()}
        return {userId, scopes, sequelize, dataRouter, metadataHandler, pubsub}
      },
      onOperation: async (connectionParams: {payload: {token?: string}}, operationParams: {context: Context}): Promise<{context: Context}> => {
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

