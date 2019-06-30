const crypto = require('crypto')
const https = require('https')
const fs = require('fs')
const path = require('path')

const { emptyDir, move, pathExists, remove } = require('fs-extra')
const { spawn } = require('promisify-child-process')

const NODE_VERSION = '10.16.0'
const NODE_DOWNLOAD_HASH = '3a3710722a1ce49b4c72c4af3155041cce3c4f632260ec8533be3fc7fd23f92c'

const NODE_FULL_VERSION = `node-v${NODE_VERSION}-linux-armv7l`
const NODE_TAR_FILE = `${NODE_FULL_VERSION}.tar.xz`
const NODE_FILE_URL = `https://nodejs.org/dist/v${NODE_VERSION}/${NODE_TAR_FILE}`

const rootDir = path.resolve(__dirname, '..')
const buildDir = path.join(rootDir, 'build')
const nodeTarFile = path.join(buildDir, NODE_TAR_FILE)
const nodeExtractDir = path.join(buildDir, NODE_FULL_VERSION)

const bundleDir = path.join(buildDir, 'bundle')
const nodeDirInBundle = path.join(bundleDir, 'node')

async function bundle() {
  await emptyDir(bundleDir)

  // Download node.js for ARMv7 if needed
  if (!await pathExists(nodeTarFile) || NODE_DOWNLOAD_HASH !== await calcHash(nodeTarFile)) {
    console.log(`downloading ${NODE_FILE_URL}...`)
    await httpsGet({url: NODE_FILE_URL, destFile: nodeTarFile})
    const actualHash = await calcHash(nodeTarFile)
    if (NODE_DOWNLOAD_HASH !== actualHash)
      throw Error(`hash of build/${NODE_TAR_FILE} did not match: expected ${NODE_DOWNLOAD_HASH}, was ${actualHash}`)
  } else {
    console.log(`build/${NODE_TAR_FILE} exists and matches sha256 hash`)
  }

  await remove(nodeExtractDir)
  await spawn('tar', ['xf', NODE_TAR_FILE], {
    cwd: buildDir,
    stdio: 'inherit',
  })
  await move(nodeExtractDir, nodeDirInBundle)
}

module.exports = {
  bundle
}

if (require.main === module) {
  bundle()
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
