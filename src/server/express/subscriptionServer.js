// @flow

import {execute, subscribe} from 'graphql'
import type {GraphQLSchema} from 'graphql'
import {SubscriptionServer} from "subscriptions-transport-ws"
import verifyToken from '../auth/verifyToken'
import type DataRouter from '../data-router/DataRouter'
import {PubSubEngine} from "graphql-subscriptions"
import type Sequelize from 'sequelize'
import type MetadataHandler from '../metadata/MetadataHandler'

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
    ...serverOptions,
  } = options
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
        return {userId, scopes, sequelize, dataRouter, metadataHandler, pubsub}
      }
    },
    serverOptions
  )
}

