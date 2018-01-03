// @flow

import type Superagent from 'superagent'
import requireEnv from '@jcoreio/require-env'

const password = requireEnv('TEST_PASSWORD')

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
    const variables = options.variables || null
    const operationName = options.operationName || null

    if (!token && withToken !== false) token = (
      await superagent.post('/login')
        .type('json')
        .accept('json')
        .send({username: 'root', password})
    ).body.token

    const isMutation = /^\s*mutation/.test(query)

    const request = isMutation
      ? superagent.post('/graphql')
      : superagent.get('/graphql')
    if (token && withToken !== false) {
      request.set('authorization', `bearer ${token}`)
    }
    request.type('json').accept('json')
    const {body} = await (isMutation
      ? request.send({query, variables, operationName})
      : request.query({query}).send({variables, operationName})
    )

    return (body: any)
  }
}

