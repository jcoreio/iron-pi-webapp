#!/usr/bin/env node
// @flow

const glob = require('glob')
const semver = require('semver')
const Promake = require('promake')
const {execSync} = require('child_process')
const {spawn} = require('child-process-async')

process.chdir(__dirname)
const pathDelimiter = /^win/.test(process.platform) ? ';' : ':'
const npmBin = execSync(`npm bin`).toString('utf8').trim()
process.env.PATH = process.env.PATH ? `${npmBin}${pathDelimiter}${process.env.PATH}` : npmBin

const {TARGET} = process.env
const build = TARGET ? `build-${TARGET}` : 'build'

const requiredNodeVersion = require('./package.json').engines.node
const nodeVersion = process.version.substring(1)
if (!semver.satisfies(nodeVersion, requiredNodeVersion)) {
  console.error(`Error: you must use node ${requiredNodeVersion} (your version: ${nodeVersion})`) // eslint-disable-line no-console
  process.exit(1)
}

const promake = new Promake()
const {rule, task, exec, cli} = promake
const envRule = require('promake-env').envRule(rule)

rule('node_modules', ['package.json', 'yarn.lock'], () => exec('yarn --ignore-scripts'))

function env(...names /* : Array<string> */) /* : string */ {
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
  serverEnv,
  'node_modules',
  '.babelrc',
  ...glob.sync('src/server/**/.babelrc')
]

envRule(serverEnv, ['NODE_ENV', 'BABEL_ENV', 'CI'])
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

envRule(universalEnv, ['NODE_ENV', 'BABEL_ENV', 'CI'])
rule(buildUniversal, universalPrerequisites, () =>
  spawn(`babel`, ['src/universal', '--out-dir', `${build}/universal`], {env: env('prod'), stdio: 'inherit'})
)
task(`${build}/universal`, buildUniversal)

task('build:server', [...buildServer, ...buildUniversal])

const clientEnv = `${build}/.clientEnv`
const srcClient = glob.sync('src/client/**/*.js')
const buildClient = [`${build}/assets.json`]
const clientPrerequisites = [
  ...srcUniversal,
  ...srcClient,
  clientEnv,
  'node_modules',
  'webpack/webpack.config.prod.js'
]

envRule(clientEnv, ['NODE_ENV', 'BABEL_ENV', 'CI', 'NO_UGLIFY', 'NO_HAPPYPACK'])
rule(buildClient, clientPrerequisites, () =>
  spawn(`webpack`, ['--config', 'webpack/webpack.config.prod.js', '--colors'], {env: env('prod'), stdio: 'inherit'})
)
task(`${build}:client`, buildClient)

const dockerEnv = `${build}/.dockerEnv`
const dockerPrerequisites = [
  ...buildServer,
  ...buildUniversal,
  ...buildClient,
  dockerEnv,
  'Dockerfile',
  '.dockerignore',
]
envRule(dockerEnv, ['NPM_TOKEN', 'NODE_ENV'])
const useSudo = Boolean(process.env.CI)
task('build:docker', dockerPrerequisites, async () => {
  const commitHash = await exec('git rev-parse HEAD').stdout.toString('utf8').trim()
  await spawn(useSudo ? 'sudo' : 'docker', [
    ...(useSudo ? ['docker'] : []), 'build',
    '--build-arg', `NPM_TOKEN=${process.env.NPM_TOKEN}`,
    '--build-arg', `BUILD_DIR=${build}`,
    '--build-arg', `TARGET=${TARGET || ''}`,
    '-t', `pasonpower/webapp${TARGET ? '-' + TARGET : ''}`,
    '-t', `pasonpower/webapp${TARGET ? '-' + TARGET : ''}:${commitHash}`,
    '.'
  ], {
    env: env('prod'),
    stdio: 'inherit',
  })
})

task('build', [
  task('build:server'),
  task('build:client'),
  task('build:docker'),
])

task('clean', () => require('fs-extra').remove(build))

cli()
