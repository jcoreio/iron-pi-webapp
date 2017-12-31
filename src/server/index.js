#!/usr/bin/env babel-node
/* @flow */

import Server from './Server'

const server = new Server()
server.start().catch(error => process.exit(1))


