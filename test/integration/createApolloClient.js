// @flow

import * as React from 'react'
import {InMemoryCache} from "apollo-cache-inmemory"
import {ApolloClient} from "apollo-client"
import requireEnv from '@jcoreio/require-env'
import WebSocket from 'ws'
import {SubscriptionClient} from 'subscriptions-transport-ws'
import {WebSocketLink} from "apollo-link-ws"
import {split} from 'apollo-link'
import {HttpLink} from 'apollo-link-http'
import {setContext} from 'apollo-link-context'
import {getMainDefinition} from 'apollo-utilities'
import superagent from './util/superagent'
import fetch from 'node-fetch'

const port = requireEnv('INTEGRATION_SERVER_PORT')
const TEST_USERNAME = requireEnv('TEST_USERNAME')
const TEST_PASSWORD = requireEnv('TEST_PASSWORD')

export default async function createApolloClient(): Promise<{
  client: ApolloClient,
  close: () => void,
}> {
  const {body: {token}} = await superagent.post('/login')
    .type('json')
    .accept('json')
    .send({username: TEST_USERNAME, password: TEST_PASSWORD})

  const subscriptionClient = new SubscriptionClient(`ws://localhost:${port}/graphql`, {
    reconnect: true,
    connectionParams: () => ({token}),
  }, WebSocket)

  const authLink = setContext((_: any, {headers}: any) => {
    return {
      headers: {
        ...headers,
        authorization: `Bearer ${token}`,
      }
    }
  })

  const httpLink = new HttpLink({
    uri: `http://localhost:${port}/graphql`,
    fetch,
  })

  const wsLink = new WebSocketLink(subscriptionClient)

  const cache = new InMemoryCache()

  const client = new ApolloClient({
    // By default, this client will send queries to the
    //  `/graphql` endpoint on the same host
    link: split(
      // split based on operation type
      ({ query }: Object) => {
        const { kind, operation } = getMainDefinition(query)
        return kind === 'OperationDefinition' && operation === 'subscription'
      },
      wsLink,
      authLink.concat(httpLink),
    ),
    cache,
  })
  return {
    client,
    close: () => subscriptionClient.close(),
  }
}

