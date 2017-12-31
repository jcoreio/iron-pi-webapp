// @flow

import {describe, before, after} from 'mocha'
import requireEnv from '@jcoreio/require-env'
import Server from '../../src/server/Server'

const port = parseInt(requireEnv('INTEGRATION_SERVER_PORT'))

let server

describe('integration tests', () => {
  before(async function (): Promise<void> {
    server = new Server({port})
    await server.start()
  })

  after(async function (): Promise<void> {
    if (server != null) await server.stop()
  })

  require('./SidebarIntegrationTests')
})
