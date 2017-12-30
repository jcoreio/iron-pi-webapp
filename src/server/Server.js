// @flow

import path from 'path'
import express from 'express'
import bodyParser from 'body-parser'
import {graphqlExpress, graphiqlExpress} from 'apollo-server-express'
import {execute, subscribe} from 'graphql'
import {SubscriptionServer} from 'subscriptions-transport-ws'
import Sequelize from 'sequelize'

import type {$Request, $Response} from 'express'

import sequelize from './sequelize'
import umzug from './sequelize/umzug'
import databaseReady from './sequelize/databaseReady'
import sequelizeMigrate from './sequelize/migrate'
import graphqlSchema from './graphql/schema'
import pubsub from './graphql/pubsub'
import {getChannelState, getChannelStates, setChannelStates, getChannelStatesArray} from './localio/ChannelStates'

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
  _devGlobals: Object = {
    Sequelize,
    sequelize,
    umzug,
    graphqlSchema,
    pubsub,
    getChannelState,
    getChannelStates,
    setChannelStates,
    getChannelStatesArray,
    ...sequelize.models,
  }
  _port: number

  constructor(options?: {port?: number} = {}) {
    this._port = options.port || parseInt(requireEnv('BACKEND_PORT'))
  }

  async start(): Promise<void> {
    if (this._running) return

    await Promise.all([
      databaseReady(),
    ])

    const forceMigrate = 'production' !== process.env.NODE_ENV
    if (forceMigrate || process.env.DB_MIGRATE) await sequelizeMigrate()

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

    // istanbul ignore next
    app.get('/__coverage__', (req: $Request, res: $Response) => {
      if (!req.accepts('application/json')) {
        res.status(500).end()
        return
      }
      const {__coverage__} = global
      if (__coverage__) res.json(__coverage__)
      else res.status(404).end()
    })

    // server-side rendering
    app.get('*', (req: $Request, res: $Response) => {
      require('./ssr/serverSideRender').default(req, res)
    })

    const port = this._port
    const httpServer = this._httpServer = app.listen(port)
    SubscriptionServer.create(
      {schema: graphqlSchema, execute, subscribe},
      {server: httpServer, path: GRAPHQL_PATH},
    )

    // istanbul ignore next
    if (process.env.NODE_ENV !== 'production') {
      Object.assign(global, this._devGlobals)
    }

    log.info(`App is listening on http://0.0.0.0:${port}`)
    this._running = true
  }

  // istanbul ignore next
  async stop(): Promise<void> {
    if (!this._running) return
    this._running = false

    if (process.env.NODE_ENV !== 'production') {
      for (let key in this._devGlobals) delete global[key]
    }

    const httpServer = this._httpServer
    if (httpServer) httpServer.close()
    this._httpServer = undefined
  }
}

