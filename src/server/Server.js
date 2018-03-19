// @flow

import path from 'path'
import express from 'express'
import bodyParser from 'body-parser'
import type {GraphQLSchema} from 'graphql'
import {PubSub} from 'graphql-subscriptions'
import type {PubSubEngine} from 'graphql-subscriptions'
import createSchema from './graphql/schema'
import defaults from 'lodash.defaults'

import type {$Request, $Response, $Application} from 'express'

import Sequelize from 'sequelize'
import type Umzug from 'umzug'
import sequelizeMigrate from './sequelize/migrate'
import {defaultDbConnectionParams} from './sequelize'
import type {DbConnectionParams} from './sequelize'
import createModels from './sequelize/createModels'
import initDatabase from './initDatabase'

import redisReady from './redis/redisReady'
import redisSubscriber from './redis/RedisSubscriber'
import logger from '../universal/logger'
import requireEnv from '@jcoreio/require-env'
import handleGraphql from './express/graphql'
import handleGraphiql from './express/graphiql'
import createSubscriptionServer from './express/subscriptionServer'
import type {GraphQLDependencies} from './graphql/GraphQLContext'

const log = logger('Server')

type Options = $Shape<DbConnectionParams & {
  port: number,
}>

/**
 * Wrap server start and stop logic, to make it runnable either from a command line or
 * a testing context
 */
export default class Server {
  _httpServer: ?Object;
  _running: boolean = false
  _devGlobals: Object = {
    Sequelize,
  }
  _port: number
  _dbConnectionParams: DbConnectionParams
  _umzug: ?Umzug
  sequelize: ?Sequelize
  graphqlSchema: ?GraphQLSchema
  pubsub: PubSubEngine
  express: ?$Application

  constructor(options?: Options = {}) {
    this._port = options.port || parseInt(requireEnv('BACKEND_PORT'))
    const {host, user, database, password} = defaults(options, defaultDbConnectionParams())
    this._dbConnectionParams = {host, user, database, password}
    this.pubsub = new PubSub()
  }

  async start(): Promise<void> {
    if (this._running) return

    const {pubsub} = this

    const {sequelize, umzug} = await initDatabase({
      connectionParams: this._dbConnectionParams,
    })
    this._devGlobals.sequelize = this.sequelize = sequelize
    this._devGlobals.umzug = this._umzug = umzug

    const forceMigrate = 'production' !== process.env.NODE_ENV
    if (forceMigrate || process.env.DB_MIGRATE) await sequelizeMigrate({sequelize, umzug})

    this._devGlobals.sequelize = sequelize

    createModels(sequelize)

    Object.assign(this._devGlobals, sequelize.models)

    this._devGlobals.pubsub = pubsub

    const graphqlSchema = this.graphqlSchema = this._devGlobals.graphqlSchema = createSchema({
      sequelize,
    })

    await redisReady()
    redisSubscriber.start()

    const app = express()

    app.use((req: Object, res: Object, next: Function) => {
      if (/\/favicon\.?(jpe?g|png|ico|gif)?$/i.test(req.url)) {
        res.status(404).end()
      } else {
        next()
      }
    })


    const graphqlDependencies: GraphQLDependencies = {
      sequelize,
      pubsub,
    }

    const GRAPHQL_PATH = '/graphql'
    app.use(GRAPHQL_PATH, bodyParser.json(), handleGraphql({
      schema: graphqlSchema,
      ...graphqlDependencies,
    }))
    app.use(GRAPHQL_PATH, (error: ?Error, req: $Request, res: $Response, next: Function) => {
      if (error) {
        res.status((error: any).statusCode || 500).send({error: error.message})
        return
      }
      next(error)
    })

    if (process.env.NODE_ENV !== 'production') {
      app.use('/graphiql', handleGraphiql({endpointURL: GRAPHQL_PATH}))
    }
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

    const port = parseInt(requireEnv('BACKEND_PORT'))
    const httpServer = this._httpServer = app.listen(port)
    if (!httpServer) throw new Error('expected httpServer to be defined')
    createSubscriptionServer({
      schema: graphqlSchema,
      server: httpServer,
      path: GRAPHQL_PATH,
      dependencies: graphqlDependencies,
    })

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

    redisSubscriber.end(true)
    const httpServer = this._httpServer
    if (httpServer) httpServer.close()
    this._httpServer = undefined

    const {sequelize} = this
    if (sequelize) sequelize.close()
  }
}

