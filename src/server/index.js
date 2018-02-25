#!/usr/bin/env babel-node
/* @flow */

import Server from './Server'

export function start() {
  const server = new Server()
  server.start().catch(error => process.exit(1))
}

if (require.main === module) {
  start()
}
