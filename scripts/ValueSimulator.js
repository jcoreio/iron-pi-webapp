// @flow

import * as React from 'react'
import {InMemoryCache} from "apollo-cache-inmemory"
import {ApolloClient} from "apollo-client"
import type {ObservableQuery} from 'apollo-client'
import WebSocket from 'ws'
import {SubscriptionClient} from 'subscriptions-transport-ws'
import {WebSocketLink} from "apollo-link-ws"
import {split} from 'apollo-link'
import {HttpLink} from 'apollo-link-http'
import {setContext} from 'apollo-link-context'
import {getMainDefinition} from 'apollo-utilities'
import superagent from 'superagent'
import fetch from 'node-fetch'
import gql from 'graphql-tag'
import createSubscribeToChannelStates from '../src/universal/apollo/createSubscribeToChannelStates'

type Options = {
  rootUrl: string,
  username: string,
  password: string,
}

const CHANNEL_STATES_QUERY = gql(`query {
  Channels {
    id
    channelId
    state
  }
}`)

class ValueSimulator {
  subscriptionClient: ?SubscriptionClient
  channelStatesQuery: ?ObservableQuery
  unsubscribe: () => void
  client: ?ApolloClient
  options: Options
  interval: ?any

  constructor(options: Options) {
    this.options = options
  }

  start = async (): Promise<any> => {
    const {username, password, rootUrl} = this.options
    const {body: {token}} = await superagent.post(`${rootUrl}/login`)
      .type('json')
      .accept('json')
      .send({username, password})

    this.subscriptionClient = new SubscriptionClient(`${rootUrl.replace(/^http/, 'ws')}/graphql`, {
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
      uri: `${rootUrl}/graphql`,
      fetch,
    })

    const wsLink = new WebSocketLink(this.subscriptionClient)

    const cache = new InMemoryCache()

    this.client = new ApolloClient({
      // By default, this client will send queries to the
      //  `/graphql` endpoint on the same host
      link: split(
        // split based on operation type
        ({query}: Object) => {
          const {kind, operation} = getMainDefinition(query)
          return kind === 'OperationDefinition' && operation === 'subscription'
        },
        wsLink,
        authLink.concat(httpLink),
      ),
      cache,
    })

    const channelStatesQuery = this.channelStatesQuery = this.client.watchQuery({query: CHANNEL_STATES_QUERY})
    await channelStatesQuery.result()

    createSubscribeToChannelStates({data: this.channelStatesQuery})()
    this.unsubscribe = channelStatesQuery.subscribe({}).unsubscribe

    this.interval = setInterval(this.simulate, 1000)

    console.log('Started ValueSimulator.')
  }

  simulate = async () => {
    const {client} = this
    if (!client) return
    const result = await client.query({query: CHANNEL_STATES_QUERY})
    const {data: {Channels}} = result
    if (!Channels) return

    const values = []

    for (let {channelId, state} of Channels) {
      switch (state.mode) {
      case 'ANALOG_INPUT':
        values.push({channelId, value: {rawAnalogInput: Math.random()}})
        break
      case 'DIGITAL_INPUT':
        values.push({channelId, value: {rawDigitalInput: Math.random() > 0.5 ? 1 : 0}})
        break
      case 'DIGITAL_OUTPUT': {
        if (state.controlMode === 'REMOTE_CONTROL') {
          values.push({channelId, value: {controlValue: Math.random() > 0.5 ? 1 : 0}})
        }
        break
      }
      }
    }

    console.log(values)

    await client.mutate({
      mutation: gql(`mutation ($values: [JSON]!) {
        setChannelValues(values: $values)
      }`),
      variables: {
        values,
      }
    })
  }

  stop = async (): Promise<any> => {
    if (this.unsubscribe) this.unsubscribe()
    if (this.interval) clearInterval(this.interval)
    this.interval = null
    if (this.subscriptionClient) await this.subscriptionClient.close()
    this.subscriptionClient = null
    this.client = null
  }
}

module.exports = ValueSimulator

