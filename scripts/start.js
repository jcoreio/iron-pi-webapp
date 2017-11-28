#!/usr/bin/env babel-node
// @flow

import asyncScript from 'crater-util/lib/asyncScript'
import path from 'path'
import runServerWithHotRestarting from './runServerWithHotRestarting'

const srcDir = path.resolve(__dirname, '..', 'src')

async function start(): Promise<void> {
  require('./devServer')
  await runServerWithHotRestarting(srcDir)
}

export default start

// istanbul ignore next
if (!module.parent) {
  process.on('SIGINT', (): any => process.exit(0))
  process.on('SIGTERM', (): any => process.exit(0))
  asyncScript(start, {
    exitOnSuccess: false,
  })
}

