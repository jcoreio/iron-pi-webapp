// @flow

import type Sequelize from 'sequelize'
import * as graphql from 'graphql'
import type {PubSubEngine} from 'graphql-subscriptions'
import type {SyncHook} from 'tapable'

import type DataRouter from '../../data-router/DataRouter'

import createChannelState from './ChannelState'
import createChannelStates from './ChannelStates'

type Options = {
  pubsub: PubSubEngine,
  sequelize: Sequelize,
  dataRouter: DataRouter,
  hooks: {
    addSubscriptionFields: SyncHook,
  },
}

export default function createSubscription(options: Options): graphql.GraphQLObjectType {
  const {pubsub, sequelize, dataRouter, hooks: {addSubscriptionFields}} = options
  const subscriptionFields = {
    ChannelState: createChannelState({pubsub}),
    ChannelStates: createChannelStates({pubsub}),
  }
  addSubscriptionFields.call({pubsub, sequelize, dataRouter, subscriptionFields})
  return new graphql.GraphQLObjectType({
    name: 'Subscription',
    fields: subscriptionFields,
  })
}
