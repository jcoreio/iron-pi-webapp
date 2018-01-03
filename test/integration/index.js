// @flow

import {describe, before, after} from 'mocha'
import requireEnv from '@jcoreio/require-env'
import Server from '../../src/server/Server'
import graphql from './util/graphql'

const port = parseInt(requireEnv('INTEGRATION_SERVER_PORT'))
const password = requireEnv('TEST_PASSWORD')

let server

describe('integration tests', () => {
  before(async function (): Promise<void> {
    server = new Server({port})
    await server.start()
    await graphql({
      query: 'mutation ensureTestUser($password: String!) { ensureTestUser(password: $password) }',
      operationName: 'ensureTestUser',
      variables: {password},
      withToken: false,
    })
  })

  after(async function (): Promise<void> {
    if (server != null) await server.stop()
  })

  require('./AuthTests')
  require('./SidebarIntegrationTests')
})
