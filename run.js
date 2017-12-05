#!/usr/bin/env node
// @flow

/* eslint-disable flowtype/require-return-type, flowtype/require-parameter-type */

const glob = require('glob')
const Promake = require('promake')
const path = require('path')
const {execSync} = require('child_process')
const touch = require('touch')
const fs = require('fs-extra')
const requireEnv = require('./src/universal/util/requireEnv')

process.chdir(__dirname)
const pathDelimiter = /^win/.test(process.platform) ? ';' : ':'
const npmBin = execSync(`npm bin`).toString('utf8').trim()
process.env.PATH = process.env.PATH ? `${npmBin}${pathDelimiter}${process.env.PATH}` : npmBin

const {TARGET} = process.env
const build = path.resolve(TARGET ? `build-${TARGET}` : 'build')
process.env.BUILD_DIR = build

const promake = new Promake()
const {rule, task, exec, spawn, cli} = promake
const envRule = require('promake-env').envRule(rule)

rule('node_modules', ['package.json', 'yarn.lock'], async () => {
  await exec('yarn --ignore-scripts')
  await touch('node_modules')
})

function env(...names /* : Array<string> */) /* : {[name: string]: ?string} */ {
  return {
    ...process.env,
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
  'defines.js',
  ...glob.sync('src/server/**/.babelrc')
]

envRule(serverEnv, ['NODE_ENV', 'BABEL_ENV', 'CI'], {getEnv: async () => env('prod')})
rule(buildServer, serverPrerequisites, async () => {
  await fs.remove(`${build}/server`)
  await spawn('babel', ['src/server', '--out-dir', `${build}/server`], {env: env('prod')})
})

const universalEnv = `${build}/.universalEnv`
const srcUniversal = glob.sync('src/universal/**/*.js')
const buildUniversal = srcUniversal.map(file => file.replace(/^src/, build))
const universalPrerequisites = [
  ...srcUniversal,
  universalEnv,
  'node_modules',
  '.babelrc',
  'defines.js',
  ...glob.sync('src/universal/**/.babelrc')
]

envRule(universalEnv, ['NODE_ENV', 'BABEL_ENV', 'CI'], {getEnv: async () => env('prod')})
rule(buildUniversal, universalPrerequisites, async () => {
  await fs.remove(`${build}/universal`)
  await spawn(`babel`, ['src/universal', '--out-dir', `${build}/universal`], {env: env('prod')})
})
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
  ...glob.sync('webpack/**/*.js'),
]

envRule(
  clientEnv,
  [
    'NODE_ENV', 'BABEL_ENV', 'CI', 'NO_UGLIFY', 'NO_HAPPYPACK', 'WEBPACK_DEVTOOL',
    ...Object.keys(require('./webpack/defines')),
  ],
  {getEnv: async () => env('prod')}
)
rule(buildClient, clientPrerequisites, async () => {
  await fs.remove(`${build}/assets`)
  await spawn(`webpack`, ['--config', 'webpack/webpack.config.prod.js', '--colors'], {env: env('prod')})
})
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
  const dockerEnv = env('prod')
  const NPM_TOKEN = await require('./scripts/getNpmToken')(dockerEnv)
  await spawn(useSudo ? 'sudo' : 'docker', [
    ...(useSudo ? ['docker'] : []), 'build',
    '--build-arg', `NPM_TOKEN=${NPM_TOKEN}`,
    '--build-arg', `BUILD_DIR=${path.relative(__dirname, build)}`,
    '--build-arg', `TARGET=${TARGET || ''}`,
    '-t', `jcoreio/iron-pi-webapp${TARGET ? '-' + TARGET : ''}`,
    '-t', `jcoreio/iron-pi-webapp${TARGET ? '-' + TARGET : ''}:${commitHash}`,
    '.'
  ], {env: dockerEnv})
})

task('build', [
  task('build:server'),
  task('build:client'),
  task('build:docker'),
])

task('built', 'build', async () => {
  require('defaultenv')(['env/prod.js', 'env/local.js'])
  // $FlowFixMe
  await require(`${build}/server/index.js`).start()
  await new Promise(() => {})
})

task('clean', () => fs.remove(build))

const services = task('services', () =>
  spawn('docker-compose', ['up', '-d', 'db', 'redis'], {env: env('prod', 'local')})
)

task('services:logs', () =>
  spawn('docker-compose', ['logs', '-f'], {env: env('prod', 'local')})
)

task('docker', [services], () =>
  spawn('docker-compose', ['up', 'app'], {env: env('prod', 'local')})
)
task('dc', ({args}) => spawn('docker-compose', args, {env: env('prod', 'local')}))

task('docker:stop', () => spawn('docker-compose', ['stop'], {env: env('prod', 'local')}))

task('mysql', async () => {
  const dcEnv = env('prod', 'local')
  const DB_PASSWORD = requireEnv('DB_PASSWORD', dcEnv)
  const DB_NAME = requireEnv('DB_NAME', dcEnv)
  await spawn('docker-compose', ['exec', 'db', 'mysql', `-p${DB_PASSWORD}`, `-D${DB_NAME}`], {env: dcEnv})
})

task('dev:server', ['node_modules', services], async () => {
  require('defaultenv')(['env/dev.js', 'env/local.js'])
  require('babel-register')
  await require('./scripts/runServerWithHotRestarting')(path.resolve('src'))
  await new Promise(() => {})
})

task('dev:client', ['node_modules'], async () => {
  require('defaultenv')(['env/dev.js', 'env/local.js'])
  require('babel-register')
  require('./scripts/devServer')
  await new Promise(() => {})
})

task('prod:server', ['node_modules', task('build:server'), services], async () => {
  require('defaultenv')(['env/prod.js', 'env/local.js'])
  spawn('babel', ['--skip-initial-build', '--watch', 'src/server', '--out-dir', `${build}/server`])
  spawn('babel', ['--skip-initial-build', '--watch', 'src/universal', '--out-dir', `${build}/universal`])
  require('babel-register')
  await require('./scripts/runServerWithHotRestarting')(build)
  await new Promise(() => {})
})

task('prod:client', ['node_modules'], () =>
  spawn('webpack', ['--config', 'webpack/webpack.config.prod.js', '--watch', '--colors'], {env: env('prod')})
)

task('flow', 'node_modules', () => spawn('flow'))

task('flow:watch', 'node_modules', () =>
  spawn('flow-watch', [
    '--watch', '.flowconfig',
    '--watch', 'flowlib/',
    '--watch', 'src/',
    '--watch', 'test/',
    '--watch', 'webpack/',
    '--watch', 'run',
    '--watch', 'run.js',
    '--watch', 'defines.js',
  ])
)

// "lint": "eslint *.js src jcore-core scripts test util webpack",
const lintFiles = [
  'run', 'run.js', 'defines.js', 'src', 'scripts', 'test', 'webpack',
]

task('lint', 'node_modules', () => spawn('eslint', lintFiles))
task('lint:fix', 'node_modules', () => spawn('eslint', ['--fix', ...lintFiles]))
task('lint:watch', 'node_modules', () => spawn('esw', ['-w', ...lintFiles, '--changed']))

cli()
