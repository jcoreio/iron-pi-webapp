// @flow

import path from 'path'
import EventEmitter from 'events'
import express from 'express'
import bodyParser from 'body-parser'
import type {GraphQLSchema} from 'graphql'
import {PubSub} from 'graphql-subscriptions'
import type {PubSubEngine} from 'graphql-subscriptions'
import Sequelize from 'sequelize'
import type Umzug from 'umzug'
import defaults from 'lodash.defaults'
import logger from 'log4jcore'
import SPIHubClient from 'spi-hub-client'

import type {$Request, $Response, $Application} from 'express'

import {defaultDbConnectionParams} from './sequelize'
import sequelizeMigrate from './sequelize/migrate'
import createSchema from './graphql/schema'
import DataRouter, {EVENT_MAPPING_PROBLEMS_CHANGED} from './data-router/DataRouter'
import type {DataPlugin, DataPluginResources} from './data-router/PluginTypes'
import LEDHandler, {LED_MESSAGE_CONNECT_MODE, LED_MESSAGE_STATIC_MODE, LED_MESSAGE_DHCP_MODE} from './localio/LEDHandler'
import SPIHandler, {EVENT_DEVICE_STATUS} from './localio/SPIHandler'
import type {DeviceStatus} from './localio/SPIHandler'
import MetadataHandler from './metadata/MetadataHandler'
import ConnectModeHandler, {EVENT_CONNECT_BUTTON_PRESSED, EVENT_NETWORK_MODE_COMMAND} from './device/ConnectModeHandler'
import AccessCodeHandler from './device/AccessCodeHandler'
import type {SSHHandler} from './device/SSHHandler'
import DeviceSSHHandler from './device/SSHHandler'
import DeviceNetworkSettingsHandler from './network-settings/NetworkSettingsHandler'
import type {NetworkSettingsHandler} from './network-settings/NetworkSettingsHandler'

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
import type {GraphQLDependencies} from './graphql/GraphQLContext'


import createModels from './sequelize/createModels'
import type {ServerFeature} from './ServerFeature'
import initDatabase from './initDatabase'
import createFeatures from './createFeatures'
import {FEATURE_EVENT_DATA_PLUGINS_CHANGE} from './data-router/PluginTypes'
import seedDatabase from './sequelize/seedDatabase'
import GraphQLDataPlugin from './data-router/GraphQLDataPlugin'
import User from './models/User'
import {
  MAPPING_PROBLEMS, NUM_MAPPING_PROBLEMS, ROOT_PASSWORD_HAS_BEEN_SET, IN_CONNECT_MODE,
} from './graphql/subscription/constants'
import {IN_CONNECT_MODE_CHANGED} from './device/ConnectModeHandler'
import type {MappingProblem} from '../universal/data-router/PluginConfigTypes'
import TestNetworkSettingsHandler from './network-settings/TestNetworkSettingsHandler'
import TestSSHHandler from './device/TestSSHHandler'

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
    authorize,
    createToken,
    verifyToken,
  }
  _port: number
  _dbConnectionParams: DbConnectionParams
  _features: ?Array<ServerFeature>
  _umzug: ?Umzug
  _graphqlDataPlugin: GraphQLDataPlugin

  _spiHubClient = new SPIHubClient({binary: true})
  _ledHandler = new LEDHandler(this._spiHubClient)
  _spiHandler = new SPIHandler(this._spiHubClient)

  sequelize: ?Sequelize
  dataRouter: ?DataRouter
  metadataHandler: ?MetadataHandler
  connectModeHandler: ConnectModeHandler
  accessCodeHandler: AccessCodeHandler
  sshHandler: SSHHandler
  networkSettingsHandler: NetworkSettingsHandler
  graphqlSchema: ?GraphQLSchema
  pubsub: PubSubEngine
  express: ?$Application

  constructor(options?: Options = {}) {
    this._port = options.port || parseInt(requireEnv('BACKEND_PORT'))
    const {host, user, database, password} = defaults(options, defaultDbConnectionParams())
    this._dbConnectionParams = {host, user, database, password}
    this.pubsub = new PubSub()
    this._graphqlDataPlugin = new GraphQLDataPlugin(this.pubsub)
    this.connectModeHandler = new ConnectModeHandler()
    this.accessCodeHandler = new AccessCodeHandler()
    this.sshHandler = process.env.BABEL_ENV === 'test'
      ? new TestSSHHandler()
      : new DeviceSSHHandler()
    this.networkSettingsHandler = process.env.BABEL_ENV === 'test'
      ? new TestNetworkSettingsHandler()
      : new DeviceNetworkSettingsHandler()
    this._spiHubClient.on('devicesChanged', (message: Object) => {
      this.accessCodeHandler.setAccessCode(message.accessCode)
      log.info(`Access Code is ${message.accessCode}`)
    })
    this._spiHandler.on(EVENT_DEVICE_STATUS, (status: DeviceStatus) => {
      const {connectButtonLevel, connectButtonEventCount} = status
      this.connectModeHandler.setConnectButtonState({connectButtonLevel, connectButtonEventCount})
    })
    this.connectModeHandler.on(EVENT_NETWORK_MODE_COMMAND, (mode: 'static' | 'dhcp') => {
      log.info(`setting networking mode to ${mode}`)
      this.networkSettingsHandler.setMode(mode)
      this._ledHandler.sendLEDState('static' === mode ? LED_MESSAGE_STATIC_MODE : LED_MESSAGE_DHCP_MODE)
    })
    this.connectModeHandler.on(EVENT_CONNECT_BUTTON_PRESSED, () => {
      log.info('connect button pressed')
      this._ledHandler.sendLEDState(LED_MESSAGE_CONNECT_MODE)
    })
  }

  async start(): Promise<void> {
    if (this._running) return

    const {pubsub} = this

    log.info('Starting webapp server...')
    try {
      const features = this._features = await createFeatures()
      const {sequelize, umzug} = await initDatabase({
        connectionParams: this._dbConnectionParams,
        features
      })
      this._devGlobals.sequelize = this.sequelize = sequelize
      this._devGlobals.umzug = this._umzug = umzug

      await sequelizeMigrate({sequelize, umzug})

      this._devGlobals.sequelize = sequelize

      createModels(sequelize)
      for (let feature of features) {
        if (feature.addSequelizeModels) feature.addSequelizeModels({sequelize})
      }

      await seedDatabase()
      for (let feature of features) {
        if (feature.seedDatabase) feature.seedDatabase({sequelize})
      }

      Object.assign(this._devGlobals, sequelize.models)

      this._devGlobals.pubsub = this.pubsub

      const metadataHandler = this.metadataHandler = new MetadataHandler()
      const dataRouter = this.dataRouter = new DataRouter({getTagMetadata: (tag: string) => metadataHandler.getTagMetadata(tag)})
      await metadataHandler.loadMetadata()
      const dataPluginResources: DataPluginResources = {
        pubsub,
        getTagValue: (tag: string) => dataRouter.getTagValue(tag),
        getTagTimestamp: (tag: string) => dataRouter.getTagTimestamp(tag),
        tags: () => dataRouter.tags(),
        publicTags: () => dataRouter.publicTags(),
        metadataHandler,
        spiHandler: this._spiHandler
      }
      await Promise.all(features.map(feature => feature.createDataPlugins && feature.createDataPlugins(dataPluginResources)))
      dataRouter.setPlugins(this._getDataPlugins())
      for (let feature of features) {
        if (feature.getDataPlugins && feature instanceof EventEmitter) {
          feature.on(FEATURE_EVENT_DATA_PLUGINS_CHANGE, this._onFeatureDataPluginsChange)
        }
      }

      dataRouter.on(EVENT_MAPPING_PROBLEMS_CHANGED, this._handleMappingProblemsChanged)

      this._devGlobals.dataRouter = dataRouter

      const graphqlSchema = this.graphqlSchema = this._devGlobals.graphqlSchema = createSchema({
        sequelize,
        features,
      })

      const {connectModeHandler, accessCodeHandler, sshHandler, networkSettingsHandler} = this
      connectModeHandler.on(IN_CONNECT_MODE_CHANGED, this._handleConnectModeChanged)
      User.afterUpdate((user: User) => {
        if (user.username === 'root' && user.changed('passwordHasBeenSet')) {
          pubsub.publish(ROOT_PASSWORD_HAS_BEEN_SET, {
            rootPasswordHasBeenSet: user.passwordHasBeenSet,
          })
        }
      })
      for (let feature of features) {
        if (feature.addPublications) feature.addPublications({
          dataRouter,
          metadataHandler,
          pubsub,
        })
      }

      const app = this.express = express()

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
        app.post('/resetRootPassword', require('./express/resetRootPassword'))
      }

      const graphqlDependencies: GraphQLDependencies = {
        sequelize,
        dataRouter,
        metadataHandler,
        connectModeHandler,
        accessCodeHandler,
        networkSettingsHandler,
        sshHandler,
        pubsub,
      }

      const GRAPHQL_PATH = '/graphql'
      app.use(GRAPHQL_PATH, parseAuthHeader, bodyParser.json(), handleGraphql({
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

      if (process.env.NODE_ENV !== 'production' || process.env.GRAPHIQL) {
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

      for (let feature of features) {
        if (feature.addExpressRoutes) feature.addExpressRoutes({
          express: app,
          sequelize,
          graphqlSchema,
          dataRouter,
        })
      }

      // server-side rendering
      app.get('*', (req: $Request, res: $Response) => {
        require('./ssr/serverSideRender').default(req, res)
      })

      const port = this._port
      const httpServer = this._httpServer = app.listen(port)
      if (!httpServer) throw new Error("Expected httpServer to be defined")
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

      for (let feature of features) {
        if (feature.start)
          await feature.start()
      }

      log.info(`App is listening on http://0.0.0.0:${port}`)
      this._running = true

      // preload this instead of waiting for the first request
      // (the require weirdness here is to enable server-side hot-reloading)
      require('./ssr/serverSideRender')
    } catch (err) {
      log.error('Could not start server: ' + err.stack)
    }
  }

  _getDataPlugins(): Array<DataPlugin> {
    const {_graphqlDataPlugin} = this
    const features = this._features || []
    const dataPlugins: Array<DataPlugin> = [_graphqlDataPlugin].concat(...features.map(feature =>
      feature.getDataPlugins ? feature.getDataPlugins() : []
    ))
    return dataPlugins
  }

  _onFeatureDataPluginsChange = () => {
    const {dataRouter} = this
    if (dataRouter != null) dataRouter.setPlugins(this._getDataPlugins())
  }

  _handleConnectModeChanged = (inConnectMode: boolean) => {
    this.pubsub.publish(IN_CONNECT_MODE, {inConnectMode})
  }

  _handleMappingProblemsChanged = (MappingProblems: Array<MappingProblem>) => {
    const numMappingProblems = MappingProblems.length
    this.pubsub.publish(NUM_MAPPING_PROBLEMS, {numMappingProblems})
    this.pubsub.publish(MAPPING_PROBLEMS, {MappingProblems})
  }

  // istanbul ignore next
  async stop(): Promise<void> {
    if (!this._running) return
    this._running = false

    this.connectModeHandler.removeListener(IN_CONNECT_MODE_CHANGED, this._handleConnectModeChanged)
    const {dataRouter} = this
    if (dataRouter) {
      dataRouter.removeListener(EVENT_MAPPING_PROBLEMS_CHANGED, this._handleMappingProblemsChanged)
      dataRouter.stop()
    }
    const {_features} = this
    if (_features) {
      for (let feature of _features) {
        if (feature.getDataPlugins && feature instanceof EventEmitter) {
          feature.removeListener(FEATURE_EVENT_DATA_PLUGINS_CHANGE, this._onFeatureDataPluginsChange)
        }
        if (feature.stop) await feature.stop()
      }
    }

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

