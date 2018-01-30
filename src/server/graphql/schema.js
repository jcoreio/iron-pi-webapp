// @flow

import type Sequelize from 'sequelize'
import * as graphql from 'graphql'

import pubsub from './pubsub'
import createTypes from './types'
import createQuery from './query'
import createMutation from './mutation'
import createSubscription from './subscription'
import type {Store} from '../redux/types'

export type Options = {
  sequelize: Sequelize,
  store: Store,
}

export default function createSchema(options: Options): graphql.GraphQLSchema {
  const {sequelize, store} = options

  const {types, inputTypes} = createTypes(options)

  return new graphql.GraphQLSchema({
    query: createQuery({sequelize, types, store}),
    mutation: createMutation({sequelize, types, store, inputTypes}),
    subscription: createSubscription({types, store, pubsub}),
  })
}

