// @flow

import type Sequelize from 'sequelize'
import * as graphql from 'graphql'

import pubsub from './pubsub'
import createTypes from './types'
import createQuery from './query'
import createMutation from './mutation'
import createSubscription from './subscription'

export type Options = {
  sequelize: Sequelize,
}

export default function createSchema(options: Options): graphql.GraphQLSchema {
  const {sequelize} = options

  const {types, inputTypes} = createTypes(options)

  return new graphql.GraphQLSchema({
    query: createQuery({sequelize, types}),
    mutation: createMutation({sequelize, types, inputTypes}),
    subscription: createSubscription({types, pubsub}),
  })
}

