#!/usr/bin/env babel-node
/* @flow */

console.log(process.env.NODE_ENV)

import Server from './Server'
import logger from '../universal/logger'

const log = logger('server:index')

const server = new Server()

export async function start(): Promise<void> {
  try {
    log.info('Starting webapp server...')
    await server.start()
    log.info('Successfully started webapp server')
  } catch (err) {
    log.error('Could not start server: ' + err.stack)
    throw err
  }
}

// istanbul ignore next
export async function stop(): Promise<void> {
  await server.stop()
}

if (!module.parent) start().catch(error => process.exit(1))


