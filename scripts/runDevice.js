#!/usr/bin/env node
// Usage: sudo scripts/runDevice.js

const defaultEnv = require('defaultenv')
const path = require('path')
const server = require('../build/server')

process.chdir(path.join(__dirname, '..'))
defaultEnv(['env/device.js'])
server.start()
