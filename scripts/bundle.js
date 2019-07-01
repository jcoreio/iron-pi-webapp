const crypto = require('crypto')
const { https } = require('follow-redirects') // same API as node https, but follows redirects
const fs = require('fs')
const path = require('path')

const { copy, emptyDir, ensureDir, move, pathExists, remove } = require('fs-extra')
const { logger } = require('log4jcore')
const { spawn } = require('promisify-child-process')
const { bundle: makeTarBundle } = require('@jcoreio/tar-bundler')

const { version } = require('../package.json')

const log = logger('bundle')

const APP_NAME = 'iron-pi-webapp'

const NODE_VERSION = '10.16.0'
const NODE_HASH = '3a3710722a1ce49b4c72c4af3155041cce3c4f632260ec8533be3fc7fd23f92c'

const IRON_PI_SPI_HANDLER_VERSION = '1.0.1'
const IRON_PI_SPI_HANDLER_HASH = '53c90baa1e4ae6f5ac705fdb94797be8ffa1ca94099f57d753295e5a192f33b1'
const IRON_PI_SPI_HANDLER_TAR_FILE = `iron-pi-spi-handler-v${IRON_PI_SPI_HANDLER_VERSION}.tar.bz2`
const IRON_PI_SPI_HANDLER_URL = `https://github.com/jcoreio/iron-pi-spi-handler/releases/download/v${IRON_PI_SPI_HANDLER_VERSION}/${IRON_PI_SPI_HANDLER_TAR_FILE}`

const NODE_FULL_VERSION = `node-v${NODE_VERSION}-linux-armv7l`
const NODE_TAR_FILE = `${NODE_FULL_VERSION}.tar.xz`
const NODE_FILE_URL = `https://nodejs.org/dist/v${NODE_VERSION}/${NODE_TAR_FILE}`

const rootDir = path.resolve(__dirname, '..')
const buildDir = path.join(rootDir, 'build')
const nodeTarFile = path.join(buildDir, NODE_TAR_FILE)
const ironPiSpiHandlerTarFile = path.join(buildDir, IRON_PI_SPI_HANDLER_TAR_FILE)
const nodeExtractDir = path.join(buildDir, NODE_FULL_VERSION)

const bundleDir = path.join(buildDir, 'bundle')
const bundleNodeDir = path.join(bundleDir, 'node')
const bundleAppDir = path.join(bundleDir, 'iron-pi-webapp')

const distDir = path.join(rootDir, 'dist')

async function bundle() {
  await emptyDir(bundleDir)

  // Download node.js for ARMv7 if needed
  await ensureDownloaded({
    url: NODE_FILE_URL,
    destFile: nodeTarFile,
    hash: NODE_HASH,
  })

  // Move extracted node.js into target bundle dir
  log.info('extracting node.js')
  await remove(nodeExtractDir)
  await spawn('tar', ['xf', NODE_TAR_FILE], {
    cwd: buildDir,
    stdio: 'inherit',
  })
  log.info('moving node.js into target bundle')
  await move(nodeExtractDir, bundleNodeDir)

  log.info('creating bundle app dir')
  await emptyDir(bundleAppDir)
  const rootAssets = [path.join('env', 'device.js'), 'index.js', 'LICENSE', 'package.json', 'README.md', 'yarn.lock']
  const builtAssets = ['assets', 'server', 'universal'].map(dir => path.join('build', dir))
  for (const fileOrDir of [...rootAssets, ...builtAssets]) {
    await copy(path.join(rootDir, fileOrDir), path.join(bundleAppDir, fileOrDir))
  }

  log.info('installing production deps in app dir')
  await spawn('yarn', ['--production', '--frozen-lockfile'], {
    cwd: bundleAppDir,
    stdio: 'inherit',
  })

  log.info('adding iron-pi-spi-handler to bundle')
  await ensureDownloaded({
    url: IRON_PI_SPI_HANDLER_URL,
    destFile: ironPiSpiHandlerTarFile,
    hash: IRON_PI_SPI_HANDLER_HASH,
  })
  await spawn('tar', ['xf', ironPiSpiHandlerTarFile], {
    cwd: bundleDir,
    stdio: 'inherit',
  })

  log.info('adding os dir to bundle')
  await copy(path.join(rootDir, 'os'), path.join(bundleDir, 'os'))

  const tarFileName = `${APP_NAME}-v${version}.tar.bz2`
  log.info(`writing distribution bundle to dist/${tarFileName}`)
  await ensureDir(distDir)
  await makeTarBundle({ srcDir: bundleDir, destFile: path.join(distDir, tarFileName) })
  log.info(`wrote distribution bundle to dist/${tarFileName}`)
}

module.exports = {
  bundle
}

if (require.main === module) {
  bundle()
}

async function ensureDownloaded({url, destFile, hash}) {
  if (!await pathExists(destFile) || hash !== await calcHash(destFile)) {
    log.info(`downloading ${url}`)
    await httpsGet({ url, destFile })
    const actualHash = await calcHash(destFile)
    if (hash !== actualHash)
      throw Error(`hash of ${destFile} did not match: expected ${hash}, was ${actualHash}`)
  } else {
    log.info(`${destFile} exists and matches sha256 hash`)
  }
}

async function httpsGet({url, destFile}) {
  const file = fs.createWriteStream(destFile)
  await new Promise((resolve, reject) => {
    https.get(url, (response) => {
      response.pipe(file)
      file.on('finish', () => file.close(resolve))
    }).on('error', (err) => { // Handle errors
      fs.unlink(destFile)
      reject(err)
    })
  })
}

async function calcHash(path/*: string*/)/*: Promise<string>*/ {
  const hash = crypto.createHash('sha256')
  const stream = fs.createReadStream(path)
  stream.on('data', data => hash.update(data, 'utf8'))
  return await new Promise((resolve/*: Function*/, reject/*: Function*/) => {
    stream.on('end', () => {
      const digest = hash.digest('hex')
      if (digest)
        resolve(digest)
      else
        reject(new Error('unexpected empty hash'))
    })
  })
}
