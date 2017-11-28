#!/usr/bin/env babel-node
// @flow

import asyncScript from 'crater-util/lib/asyncScript'
import minimist from 'minimist'
import spawn from 'crater-util/lib/spawn'
import fs from 'fs'
import path from 'path'
import promisify from 'es6-promisify'
import webpack from 'webpack'
import runServerWithHotRestarting from './runServerWithHotRestarting'
import getServerSrcDirs from './util/getServerSrcDirs'

const args = minimist(process.argv.slice(2))
const doWebpack = args.webpack === undefined ? true : !!args.webpack

// Use require() here so that our setenv() runs first
const clientConfig = require('../webpack/webpack.config.prod').default

const {BUILD_DIR} = process.env
if (!BUILD_DIR) throw new Error("missing process.env.BUILD_DIR")

const root = path.resolve(__dirname, '..')

async function prod(): Promise<any> {
  const serverDirs = await getServerSrcDirs()

  // delete build timestamps since we don't know for sure if the project will be in a perfectly built state after
  // the user quits prod mode
  const unlink = promisify(fs.unlink)
  for (let timestampFile of ['.lastClientBuildTimestamp', '.lastServerBuildTimestamp']) {
    try {
      await unlink(path.join(BUILD_DIR, timestampFile))
    } catch (err) {
      if ('ENOENT' !== err.code) throw err
    }
  }

  for (let dir of serverDirs) {
    spawn('babel', ['--watch', path.join('src', dir), '--out-dir', path.join(BUILD_DIR, dir)], {
      cwd: root,
      stdio: 'pipe',
    })
  }

  function launchWebpack(config: Object): Promise<void> {
    return new Promise((_resolve: Function) => {
      let resolved = false
      function resolve() {
        if (!resolved) {
          resolved = true
          _resolve()
        }
      }
      const compiler = webpack(config)
      compiler.watch({}, (err: ?Error, stats: Object) => {
        // istanbul ignore next
        if (err) {
          console.error(err.stack)
          return
        }
        process.stdout.write(stats.toString({
          colors: true,
          modules: false,
          chunkModules: false,
          chunks: true,
          errorDetails: true,
        }) + "\n")
        // istanbul ignore next
        if (stats.toJson().errors.length) return
        resolve()
      })
    })
  }

  if (doWebpack) await launchWebpack(clientConfig)
  await runServerWithHotRestarting(BUILD_DIR)
}

export default prod

// istanbul ignore next
if (!module.parent) {
  process.on('SIGINT', (): any => process.exit(0))
  process.on('SIGTERM', (): any => process.exit(0))
  asyncScript(prod, {
    exitOnSuccess: false,
  })
}
