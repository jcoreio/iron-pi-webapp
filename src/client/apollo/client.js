// @flow

import { ApolloClient } from 'apollo-client'
import { split } from 'apollo-link'
import { HttpLink } from 'apollo-link-http'
import { WebSocketLink } from 'apollo-link-ws'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { getMainDefinition } from 'apollo-utilities'

// Create an http link:
const httpLink = new HttpLink({
  uri: `${window.location.origin}/graphql`
})

// Create a WebSocket link:
const wsLink = new WebSocketLink({
  uri: `ws://${window.location.host}/graphql`,
  options: {
    reconnect: true
  }
})

export default new ApolloClient({
  // By default, this client will send queries to the
  //  `/graphql` endpoint on the same host
  link: split(
    // split based on operation type
    ({ query }: Object) => {
      const { kind, operation } = getMainDefinition(query)
      return kind === 'OperationDefinition' && operation === 'subscription'
    },
    wsLink,
    httpLink,
  ),
  cache: new InMemoryCache().restore(window.__APOLLO_STATE__),
})

