import path from 'path'
import exec from 'crater-util/lib/exec'
import spawnAsync from 'crater-util/lib/spawnAsync'
import {childPrinted} from 'async-child-process'
import kill from 'crater-util/lib/kill'
import {findAPortNotInUse} from 'portscanner'
import superagent from 'superagent'

const root = path.resolve(__dirname, '..', '..')

describe('webapp integration tests', function () {
  let server

  before(async function () {
    this.timeout(15 * 60000)

    let foundRunningServer = false
    if (process.env.ROOT_URL) {
      await superagent.get(`${process.env.ROOT_URL}/__test__`)
        .then(() => foundRunningServer = true)
        .catch(() => { /* ignore */ })
    }

    if (foundRunningServer) {
      console.log('Found server running on ' + process.env.ROOT_URL) // eslint-disable-line no-console
    } else {
      process.env.PORT = process.env.BACKEND_PORT = String(await findAPortNotInUse(3000, 8000))
      process.env.ROOT_URL = `http://localhost:${process.env.PORT}`

      await spawnAsync('npm', ['run', 'build'], {cwd: root})
      server = exec(`node ${process.env.BUILD_DIR}/server/index.js`, {cwd: root})
      await childPrinted(server, /App is listening on http/i)

      // make sure server is running in test mode
      await superagent.get(`${process.env.ROOT_URL}/__test__`)
    }
  })

  after(async function () {
    this.timeout(15 * 60000)
    if (server) await kill(server, 'SIGINT')
  })

  beforeEach(async function () {
    // TODO: clear tables
  })

  require('./basicTests')
})


