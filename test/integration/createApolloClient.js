// @flow

import * as React from 'react'
import {InMemoryCache} from "apollo-cache-inmemory"
import {ApolloClient} from "apollo-client"
import requireEnv from '@jcoreio/require-env'
import WebSocket from 'ws'

import {SubscriptionClient} from 'subscriptions-transport-ws'
import {WebSocketLink} from "apollo-link-ws"

const port = requireEnv('INTEGRATION_SERVER_PORT')

export default function createApolloClient(): {
  client: ApolloClient,
  close: () => void,
  } {
  const subscriptionClient = new SubscriptionClient(`ws://localhost:${port}/graphql`, {}, WebSocket)
  const client = new ApolloClient({
    link: new WebSocketLink(subscriptionClient),
    cache: new InMemoryCache(),
  })
  return {
    client,
    close: () => subscriptionClient.close(),
  }
}

