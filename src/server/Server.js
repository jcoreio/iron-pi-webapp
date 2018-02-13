// @flow

import path from 'path'
import express from 'express'
import bodyParser from 'body-parser'
import type {GraphQLSchema} from 'graphql'
import Sequelize from 'sequelize'
import type Umzug from 'umzug'
import defaults from 'lodash.defaults'
import logger from 'log4jcore'

import type {$Request, $Response} from 'express'

import {defaultDbConnectionParams} from './sequelize'
import sequelizeMigrate from './sequelize/migrate'
import createSchema from './graphql/schema'
import pubsub from './graphql/pubsub'
import DataRouter from './data-router/DataRouter'

import requireEnv from '@jcoreio/require-env'
import type {DbConnectionParams} from './sequelize'
import login from './express/login'
import parseAuthHeader from './express/parseAuthHeader'
import handleGraphql from './express/graphql'
import handleGraphiql from './express/graphiql'
import authorize from './auth/authorize'
import createToken from './auth/createToken'
import verifyToken from './auth/verifyToken'
import requireAuthHeader from './express/requireAuthHeader'
import createSubscriptionServer from './express/subscriptionServer'

import {SyncHook, AsyncSeriesHook} from 'tapable'
import createModels from './sequelize/createModels'
import type {ServerFeature} from './ServerFeature'
import initDatabase from './initDatabase'
import getFeatures from './getFeatures'

const log = logger('Server')

type Options = $Shape<DbConnectionParams & {
  port: number,
  features: Array<ServerFeature>,
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
    pubsub,
    authorize,
    createToken,
    verifyToken,
  }
  _port: number
  dbConnectionParams: DbConnectionParams
  sequelize: ?Sequelize
  umzug: ?Umzug
  graphqlSchema: ?GraphQLSchema
  dataRouter: ?DataRouter
  features: ?Array<ServerFeature>
  hooks = {
    createModels: new AsyncSeriesHook(['sequelize']),
    graphql: {
      addTypes: new SyncHook(['options']),
      addInputTypes: new SyncHook(['options']),
      addQueryFields: new SyncHook(['options']),
      addMutationFields: new SyncHook(['options']),
      addSubscriptionFields: new SyncHook(['options']),
    },
    addExpressRoutes: new SyncHook(['options']),
  }

  constructor(options?: Options = {}) {
    this._port = options.port || parseInt(requireEnv('BACKEND_PORT'))
    const {host, user, database, password} = defaults(options, defaultDbConnectionParams())
    this.dbConnectionParams = {host, user, database, password}
  }

  async start(): Promise<void> {
    if (this._running) return

    log.info('Starting webapp server...')
    try {
      this.features = await getFeatures()
      // for (let feature of this.features) {
      //   feature.install(this.hooks)
      // }
      const {sequelize, umzug} = await initDatabase(this.dbConnectionParams)
      this._devGlobals.sequelize = this.sequelize = sequelize
      this._devGlobals.umzug = this.umzug = umzug

      const forceMigrate = 'production' !== process.env.NODE_ENV
      if (forceMigrate || process.env.DB_MIGRATE) await sequelizeMigrate({sequelize, umzug})

      this._devGlobals.sequelize = sequelize

      const dataRouter = this.dataRouter = new DataRouter()
      this._devGlobals.dataRouter = dataRouter

      createModels(sequelize)
      await this.hooks.createModels.promise(sequelize)

      Object.assign(this._devGlobals, sequelize.models)

      const graphqlSchema = this.graphqlSchema = this._devGlobals.graphqlSchema = createSchema({
        sequelize,
        dataRouter,
        hooks: this.hooks.graphql,
      })

      const app = express()

      app.use((req: Object, res: Object, next: Function) => {
        if (/\/favicon\.?(jpe?g|png|ico|gif)?$/i.test(req.url)) {
          res.status(404).end()
        } else {
          next()
        }
      })

      app.post('/login', bodyParser.json(), login)
      app.use('/verifyToken', requireAuthHeader, parseAuthHeader, (req: $Request, res: $Response) => {
        res.status(req.userId ? 200 : 500).send()
      })
      app.use('/verifyToken', (error: ?Error, req: $Request, res: $Response, next: Function) => {
        if (error) {
          res.status((error: any).statusCode || 500).send(error.message + '\n')
          return
        }
        res.status(req.userId ? 200 : (error: any).statusCode || 500).send()
      })
      if (process.env.BABEL_ENV === 'test') {
        app.post('/createTestToken', parseAuthHeader, bodyParser.json(), require('./express/createTestToken'))
      }

      const GRAPHQL_PATH = '/graphql'
      app.use(GRAPHQL_PATH, parseAuthHeader, bodyParser.json(), handleGraphql({sequelize, schema: graphqlSchema}))
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

      this.hooks.addExpressRoutes.call({app, sequelize, graphqlSchema})

      // server-side rendering
      app.get('*', (req: $Request, res: $Response) => {
        require('./ssr/serverSideRender').default(req, res)
      })

      const port = this._port
      const httpServer = this._httpServer = app.listen(port)
      createSubscriptionServer({
        schema: graphqlSchema,
        server: httpServer,
        path: GRAPHQL_PATH,
      })

      // istanbul ignore next
      if (process.env.NODE_ENV !== 'production') {
        Object.assign(global, this._devGlobals)
      }

      log.info(`App is listening on http://0.0.0.0:${port}`)
      this._running = true
    } catch (err) {
      log.error('Could not start server: ' + err.stack)
    }
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

    const {sequelize} = this
    if (sequelize) sequelize.close()
  }
}

