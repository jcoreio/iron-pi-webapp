// @flow

import { ApolloClient } from 'apollo-client'
import { split, ApolloLink } from 'apollo-link'
import { HttpLink } from 'apollo-link-http'
import { RetryLink } from 'apollo-link-retry'
import { setContext } from 'apollo-link-context'
import { WebSocketLink } from 'apollo-link-ws'
import { InMemoryCache, IntrospectionFragmentMatcher } from 'apollo-cache-inmemory'
import { getMainDefinition } from 'apollo-utilities'
import dataIdFromObject from '../../universal/apollo/dataIdFromObject'

type Options = {
  onForbidden?: (error: string) => any,
  introspectionQueryResultData?: {
    __schema: {
      types: Array<{
        kind: string,
        name: string,
        possibleTypes: ?Array<{name: string}>,
      }>,
    },
  },
}

function getMessage(error: Error & {result?: {error?: string}}): string {
  const {result} = error
  if (result) {
    if (result.error) return result.error
  }
  return error.message
}

export default function createClient(options: Options = {}): ApolloClient {
  const {onForbidden, introspectionQueryResultData} = options
  const withRetries = new RetryLink({
    delay: {
      max: 30 * 1000,
    },
    attempts: (count: number, operation: any, error: ?Error) => {
      const finalError = error
      if (!finalError) return false
      const {statusCode} = (finalError: any)
      const message = getMessage(finalError)
      if (statusCode === 403 && onForbidden) setTimeout(() => onForbidden(message), 0)
      return statusCode == null || statusCode < 500
    }
  })

  const authLink = setContext((_: any, {headers}: { headers: Object }) => {
    // get the authentication token from local storage if it exists
    const token = localStorage.getItem('token')
    // return the headers to the context so httpLink can read them
    return {
      headers: {
        ...headers,
        authorization: token ? `Bearer ${token}` : null,
      }
    }
  })

  // Create an http link:
  const httpLink = new HttpLink({
    uri: `${window.location.origin}/graphql`
  })

  const subscriptionMiddleware = {
    applyMiddleware(options: Object, next: Function) {
      options.token = localStorage.getItem('token')
      next()
    }
  }

  // Create a WebSocket link:
  const wsLink = new WebSocketLink({
    uri: `ws://${window.location.host}/graphql`,
    options: {
      reconnect: true,
      // connectionParams: () => ({token: localStorage.getItem('token')}),
    }
  })
  wsLink.subscriptionClient.use([subscriptionMiddleware])

  const cacheOptions = {dataIdFromObject}
  if (introspectionQueryResultData) (cacheOptions: Object).fragmentMatcher = new IntrospectionFragmentMatcher({
    introspectionQueryResultData
  })
  const cache = new InMemoryCache(cacheOptions).restore(window.__APOLLO_STATE__)

  return new ApolloClient({
    // By default, this client will send queries to the
    //  `/graphql` endpoint on the same host
    link: split(
      // split based on operation type
      ({query}: Object) => {
        const {kind, operation} = getMainDefinition(query)
        return kind === 'OperationDefinition' && operation === 'subscription'
      },
      wsLink,
      ApolloLink.from([
        withRetries,
        authLink,
        httpLink,
      ])
    ),
    cache,
  })
}
