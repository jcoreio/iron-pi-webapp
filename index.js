#!/usr/bin/env node
// Usage: sudo node index.js

const defaultEnv = require('defaultenv')
const server = require('./build/server')

process.chdir(__dirname)
defaultEnv(['env/device.js'])
server.start()
