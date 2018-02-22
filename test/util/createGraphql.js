// @flow

import type Superagent from 'superagent'
import requireEnv from '@jcoreio/require-env'
import {parse} from 'graphql'
import type {DocumentNode} from 'graphql'
import getOnlyOperationName from './getOnlyOperationName'

const TEST_USERNAME = requireEnv('TEST_USERNAME')
const TEST_PASSWORD = requireEnv('TEST_PASSWORD')

type Options = {
  query: string,
  variables?: Object,
  operationName?: string,
  withToken?: boolean,
}

type Result<T> = {
  data: T,
}

export default function createGraphql<T>(superagent: Superagent): (options: Options) => Promise<Result<T>> {
  let token: ?string

  return async (options: Options) => {
    const {query, withToken} = options
    const doc: DocumentNode = parse(query)
    const variables = options.variables || null
    const operationName = options.operationName || getOnlyOperationName(doc)

    if (!token && withToken !== false) token = (
      await superagent.post('/login')
        .type('json')
        .accept('json')
        .send({username: TEST_USERNAME, password: TEST_PASSWORD})
    ).body.token

    const request = superagent.post('/graphql')
    if (token && withToken !== false) {
      request.set('authorization', `bearer ${token}`)
    }
    request.type('json').accept('json')
    const {body} = await request.send({query, variables, operationName})

    return (body: any)
  }
}

