// @flow

import superagent from './superagent'

type Options = {
  query: string,
  variables: Object,
  operationName: string,
}

type Result<T> = {
  data: T,
}

async function graphql<T>({query, variables, operationName}: Options): Promise<Result<T>> {
  const {body} = await superagent.get('/graphql')
    .type('json')
    .accept('json')
    .query({query})
    .send({variables, operationName})

  return (body: any)
}

export default graphql

