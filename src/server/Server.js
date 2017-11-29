// @flow

import path from 'path'
import express from 'express'

import type {$Request, $Response} from 'express'
// $FlowFixMe
import type {REPLServer} from 'repl'

import sequelizeMigrate from './sequelize/migrate'

import redisSubscriber from './redis/RedisSubscriber'
import setupWebSocketHandler from './setupWebSocketHandler'
// import publishCollections from './redis/publishCollections'
import logger from '../universal/logger'
import requireEnv from '../universal/util/requireEnv'

import './methods'
import './publications'

const log = logger('Server')

/**
 * Wrap server start and stop logic, to make it runnable either from a command line or
 * a testing context
 */
export default class Server {
  _httpServer: ?Object;
  _running: boolean = false
  _replServer: ?REPLServer;

  async start(): Promise<void> {
    if (this._running) return

    redisSubscriber.start()

    if (process.env.REPLIFY) this._replServer = require('./repl')

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

    app.use('/assets', express.static(path.resolve(__dirname, '..', 'assets')))
    app.use('/static', express.static(path.resolve(__dirname, '..', '..', 'static')))

    // istanbul ignore next
    if (process.env.BABEL_ENV === 'test') {
      app.use('/__test__', require('./express/test'))
    } else {
      app.get('/__test__/*', (req: $Request, res: $Response) => res.status(404).send('no!'))
    }

    // server-side rendering
    app.get('*', (req: $Request, res: $Response) => {
      require('./ssr/serverSideRender').default(req, res)
    })

    const port = parseInt(requireEnv('BACKEND_PORT'))
    const httpServer = this._httpServer = app.listen(port)
    setupWebSocketHandler(httpServer)
    log.info(`App is listening on http://0.0.0.0:${port}`)
    this._running = true
  }

  async stop(): Promise<void> {
    if (!this._running) return
    this._running = false
    redisSubscriber.end(true)
    const httpServer = this._httpServer
    if (httpServer) httpServer.close()
    this._httpServer = undefined
    const replServer = this._replServer
    if (replServer) replServer.close()
    this._replServer = undefined
  }
}

