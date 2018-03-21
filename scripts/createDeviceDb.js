#!/usr/bin/env node
// Usage: sudo scripts/runDevice.js


const defaultEnv = require('defaultenv')
const path = require('path')
const initDatabase = require('../build/server/initDatabase').default

process.chdir(path.join(__dirname, '..'))
defaultEnv(['env/device.js'])
initDatabase()
