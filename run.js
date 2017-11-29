#!/usr/bin/env node
// @flow

/* eslint-disable flowtype/require-return-type, flowtype/require-parameter-type */

const glob = require('glob')
const Promake = require('promake')
const path = require('path')
const {execSync} = require('child_process')
const {spawn} = require('child-process-async')
const touch = require('touch')

process.chdir(__dirname)
const pathDelimiter = /^win/.test(process.platform) ? ';' : ':'
const npmBin = execSync(`npm bin`).toString('utf8').trim()
process.env.PATH = process.env.PATH ? `${npmBin}${pathDelimiter}${process.env.PATH}` : npmBin

const {TARGET} = process.env
const build = path.resolve(TARGET ? `build-${TARGET}` : 'build')

const promake = new Promake()
const {rule, task, exec, cli} = promake
const envRule = require('promake-env').envRule(rule)

rule('node_modules', ['package.json', 'yarn.lock'], async () => {
  await exec('yarn --ignore-scripts')
  await touch('node_modules')
})

function env(...names /* : Array<string> */) /* : {[name: string]: string} */ {
  return {
    ...process.env,
    BUILD_DIR: build,
    ...require('defaultenv')(names.map(name => `env/${name}.js`), {noExport: true}),
  }
}

const serverEnv = `${build}/.serverEnv`
const srcServer = glob.sync('src/server/**/*.js')
const buildServer = srcServer.map(file => file.replace(/^src/, build))
const serverPrerequisites = [
  ...srcServer,
  'node_modules',
  serverEnv,
  '.babelrc',
  ...glob.sync('src/server/**/.babelrc')
]

envRule(serverEnv, ['NODE_ENV', 'BABEL_ENV', 'CI'], {getEnv: async () => env('prod')})
rule(buildServer, serverPrerequisites, () =>
  spawn('babel', ['src/server', '--out-dir', `${build}/server`], {env: env('prod'), stdio: 'inherit'})
)
task(`${build}/server`, buildServer)

const universalEnv = `${build}/.universalEnv`
const srcUniversal = glob.sync('src/universal/**/*.js')
const buildUniversal = srcUniversal.map(file => file.replace(/^src/, build))
const universalPrerequisites = [
  ...srcUniversal,
  universalEnv,
  'node_modules',
  '.babelrc',
  ...glob.sync('src/universal/**/.babelrc')
]

envRule(universalEnv, ['NODE_ENV', 'BABEL_ENV', 'CI'], {getEnv: async () => env('prod')})
rule(buildUniversal, universalPrerequisites, () =>
  spawn(`babel`, ['src/universal', '--out-dir', `${build}/universal`], {env: env('prod'), stdio: 'inherit'})
)
task(`build:universal`, buildUniversal)

task('build:server', [...buildServer, ...buildUniversal])

const clientEnv = `${build}/.clientEnv`
const srcClient = glob.sync('src/client/**/*.js')
const buildClient = [`${build}/assets.json`]
const clientPrerequisites = [
  ...srcUniversal,
  ...srcClient,
  ...glob.sync('src/client/**/.babelrc'),
  clientEnv,
  'node_modules',
  'webpack/webpack.config.prod.js',
  'webpack/defines.js'
]

envRule(
  clientEnv,
  [
    'NODE_ENV', 'BABEL_ENV', 'CI', 'NO_UGLIFY', 'NO_HAPPYPACK', 'WEBPACK_DEVTOOL',
    ...Object.keys(require('./webpack/defines')),
  ],
  {getEnv: async () => env('prod')}
)
rule(buildClient, clientPrerequisites, () =>
  spawn(`webpack`, ['--config', 'webpack/webpack.config.prod.js', '--colors'], {env: env('prod'), stdio: 'inherit'})
)
task(`build:client`, buildClient)

const dockerEnv = `${build}/.dockerEnv`
const dockerPrerequisites = [
  ...buildServer,
  ...buildUniversal,
  ...buildClient,
  'node_modules',
  dockerEnv,
  'Dockerfile',
  '.dockerignore',
]
envRule(dockerEnv, ['NPM_TOKEN', 'NODE_ENV'], {getEnv: async () => env('prod')})
const useSudo = Boolean(process.env.CI)
task('build:docker', dockerPrerequisites, async () => {
  const commitHash = (await exec('git rev-parse HEAD')).stdout.toString('utf8').trim()
  const buildEnv = env('prod')
  if (!buildEnv.NPM_TOKEN) throw new Error('missing process.env.NPM_TOKEN')
  await spawn(useSudo ? 'sudo' : 'docker', [
    ...(useSudo ? ['docker'] : []), 'build',
    '--build-arg', `NPM_TOKEN=${buildEnv.NPM_TOKEN}`,
    '--build-arg', `BUILD_DIR=${build}`,
    '--build-arg', `TARGET=${TARGET || ''}`,
    '-t', `jcoreio/iron-pi-webapp${TARGET ? '-' + TARGET : ''}`,
    '-t', `jcoreio/iron-pi-webapp${TARGET ? '-' + TARGET : ''}:${commitHash}`,
    '.'
  ], {
    env: buildEnv,
    stdio: 'inherit',
  })
})

task('build', [
  task('build:server'),
  task('build:client'),
  task('build:docker'),
])

task('clean', () => require('fs-extra').remove(build))

const services = task('services', () => spawn('docker-compose', ['up', '-d', 'db', 'redis'], {
  env: env('prod', 'local'), stdio: 'inherit'
}))

task('services:logs', () => spawn('docker-compose', ['logs', '-f'], {env: env('prod', 'local'), stdio: 'inherit'}))

task('mysql', async () => {
  const dcEnv = env('prod', 'local')
  await spawn('docker-compose', ['exec', 'db', 'mysql', `-p${dcEnv.DB_PASSWORD}`], {
    env: dcEnv, stdio: 'inherit'
  })
})

task('dev:backend', ['node_modules', services], async () => {
  process.env.BUILD_DIR = build
  require('defaultenv')(['env/dev.js', 'env/local.js'])
  require('babel-register')
  await require('./scripts/runServerWithHotRestarting')(path.resolve('src'))
  await new Promise(() => {})
})

task('dev:webpack', ['node_modules'], async () => {
  process.env.BUILD_DIR = build
  require('defaultenv')(['env/dev.js', 'env/local.js'])
  require('babel-register')
  require('./scripts/devServer')
  await new Promise(() => {})
})

task('prod:webpack', ['node_modules'], () =>
  spawn('webpack', ['--config', 'webpack/webpack.config.prod.js', '--watch', '--colors'], {
    env: env('prod'), stdio: 'inherit'
  })
)

task('repl', ['node_modules'], async () => {
  require('defaultenv')(['env/dev.js', 'env/local.js'])
  await spawn('rc', [`/tmp/repl/${process.env.DB_NAME || ''}.sock`], {stdio: 'inherit'})
})

cli()
