// @flow

import path from 'path'
import express from 'express'
import bodyParser from 'body-parser'
import {graphqlExpress, graphiqlExpress} from 'apollo-server-express'
import {execute, subscribe} from 'graphql'
import {SubscriptionServer} from 'subscriptions-transport-ws'
import graphqlSchema from './graphql/schema'

import type {$Request, $Response} from 'express'

import sequelize from './sequelize'
import sequelizeMigrate from './sequelize/migrate'
import './sequelize/loadModels'
import './graphql/addPublishHooks'
import pubsub from './graphql/pubsub'

import redisSubscriber from './redis/RedisSubscriber'
import logger from '../universal/logger'
import requireEnv from '@jcoreio/require-env'

const log = logger('Server')

/**
 * Wrap server start and stop logic, to make it runnable either from a command line or
 * a testing context
 */
export default class Server {
  _httpServer: ?Object;
  _running: boolean = false

  async start(): Promise<void> {
    if (this._running) return

    redisSubscriber.start()

    const forceMigrate = 'production' !== process.env.NODE_ENV
    if (forceMigrate || process.env.DB_MIGRATE)
      await sequelizeMigrate()

    // publishCollections(publishedCollections)

    const app = express()

    app.use((req: Object, res: Object, next: Function) => {
      if (/\/favicon\.?(jpe?g|png|ico|gif)?$/i.test(req.url)) {
        res.status(404).end()
      } else {
        next()
      }
    })

    const GRAPHQL_PATH = '/graphql'
    app.use(GRAPHQL_PATH, bodyParser.json(), graphqlExpress({
      schema: graphqlSchema,
      context: {sequelize},
    }))

    app.use('/graphiql', graphiqlExpress({endpointURL: GRAPHQL_PATH}))
    app.use('/assets', express.static(path.resolve(__dirname, '..', 'assets')))
    app.use('/static', express.static(path.resolve(__dirname, '..', '..', 'static')))

    // server-side rendering
    app.get('*', (req: $Request, res: $Response) => {
      require('./ssr/serverSideRender').default(req, res)
    })

    const port = parseInt(requireEnv('BACKEND_PORT'))
    const httpServer = this._httpServer = app.listen(port)
    SubscriptionServer.create(
      {schema: graphqlSchema, execute, subscribe},
      {server: httpServer, path: GRAPHQL_PATH},
    )

    global.graphqlSchema = graphqlSchema
    global.sequelize = sequelize
    global.pubsub = pubsub
    Object.assign(global, sequelize.models)

    log.info(`App is listening on http://0.0.0.0:${port}`)
    this._running = true
  }

  async stop(): Promise<void> {
    if (!this._running) return
    this._running = false

    delete global.graphqlSchema
    delete global.sequelize
    delete global.pubsub
    for (let model in sequelize.models) delete global[model]

    redisSubscriber.end(true)
    const httpServer = this._httpServer
    if (httpServer) httpServer.close()
    this._httpServer = undefined
  }
}

