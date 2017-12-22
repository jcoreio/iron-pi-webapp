// @flow

import path from 'path'
import express from 'express'

import type {$Request, $Response} from 'express'

import Sequelize from 'sequelize'
import sequelize from './sequelize'
import umzug from './sequelize/umzug'
import databaseReady from './sequelize/databaseReady'
import sequelizeMigrate from './sequelize/migrate'

import redisReady from './redis/redisReady'
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
  _devGlobals: Object = {
    Sequelize,
    sequelize,
    umzug,
    ...sequelize.models,
  }

  async start(): Promise<void> {
    if (this._running) return

    await Promise.all([
      databaseReady(),
      redisReady(),
    ])

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

    app.use('/assets', express.static(path.resolve(__dirname, '..', 'assets')))
    app.use('/static', express.static(path.resolve(__dirname, '..', '..', 'static')))

    // server-side rendering
    app.get('*', (req: $Request, res: $Response) => {
      require('./ssr/serverSideRender').default(req, res)
    })

    const port = parseInt(requireEnv('BACKEND_PORT'))
    this._httpServer = app.listen(port)

    if (process.env.NODE_ENV !== 'production') {
      Object.assign(global, this._devGlobals)
    }

    log.info(`App is listening on http://0.0.0.0:${port}`)
    this._running = true
  }

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
  }
}

