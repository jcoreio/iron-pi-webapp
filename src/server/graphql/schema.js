// @flow

import type Sequelize from 'sequelize'
import * as graphql from 'graphql'
import type {SyncHook} from 'tapable'

import pubsub from './pubsub'
import createTypes from './types'
import createQuery from './query'
import createMutation from './mutation'
import createSubscription from './subscription'
import type {Store} from '../redux/types'
import type DataRouter from '../data-router/DataRouter'

export type Options = {
  sequelize: Sequelize,
  store: Store,
  dataRouter: DataRouter,
  hooks: {
    addTypes: SyncHook,
    addInputTypes: SyncHook,
    addQueryFields: SyncHook,
    addMutationFields: SyncHook,
    addSubscriptionFields: SyncHook,
  },
}

export default function createSchema(options: Options): graphql.GraphQLSchema {
  const {
    sequelize,
    store,
    dataRouter,
    hooks: {
      addTypes,
      addInputTypes,
      addQueryFields,
      addMutationFields,
      addSubscriptionFields,
    }
  } = options

  const {types, inputTypes} = createTypes({sequelize, store, dataRouter, hooks: {addTypes, addInputTypes}})

  return new graphql.GraphQLSchema({
    query: createQuery({sequelize, types, store, dataRouter, hooks: {addQueryFields}}),
    mutation: createMutation({sequelize, types, store, dataRouter, inputTypes, hooks: {addMutationFields}}),
    subscription: createSubscription({sequelize, types, store, dataRouter, pubsub, hooks: {addSubscriptionFields}}),
  })
}

