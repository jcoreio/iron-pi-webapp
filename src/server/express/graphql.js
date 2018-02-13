// @flow

import type {$Request, $Response} from 'express'
import type {Context} from '../graphql/Context'
import {graphqlExpress} from "apollo-server-express"
import type Sequelize from 'sequelize'
import type {GraphQLSchema} from 'graphql'
import formatError from '../graphql/formatError'
import type DataRouter from '../data-router/DataRouter'
import type {PubSubEngine} from 'graphql-subscriptions'

type Options = {
  schema: GraphQLSchema,
  sequelize: Sequelize,
  dataRouter: DataRouter,
  pubsub: PubSubEngine,
}

export default function handleGraphql({schema, sequelize, dataRouter, pubsub}: Options): (req: $Request, res: $Response, next: Function) => any {
  return graphqlExpress((req: $Request) => {
    const {userId, scopes} = (req: Object)
    const context: Context = {
      userId,
      scopes,
      sequelize,
      dataRouter,
      pubsub,
    }
    return {
      schema,
      context,
      formatError,
    }
  })
}

