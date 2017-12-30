// @flow

import {before, after} from 'mocha'
import requireEnv from '@jcoreio/require-env'
import {SubscriptionServer} from 'subscriptions-transport-ws'
import {execute, subscribe} from 'graphql'
import schema from '../../src/server/graphql/schema'
import migrate from '../../src/server/sequelize/migrate'
import express from 'express'
import bodyParser from 'body-parser'
import {graphqlExpress} from "apollo-server-express"
import sequelize from '../../src/server/sequelize'

global.sequelize = sequelize

const port = requireEnv('INTEGRATION_SERVER_PORT')

let server

before(async function (): Promise<void> {
  const app = express()

  const GRAPHQL_PATH = '/graphql'
  app.use(GRAPHQL_PATH, bodyParser.json(), graphqlExpress({
    schema,
    context: {sequelize},
  }))

  server = app.listen(port)
  SubscriptionServer.create(
    {
      schema,
      execute,
      subscribe,
    },
    {
      server,
      path: '/graphql',
    }
  )

  await migrate()
})

after(async function (): Promise<void> {
  if (server != null) await server.close()
  await sequelize.close()
})

