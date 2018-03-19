// @flow

import type Sequelize from 'sequelize'
import * as graphql from 'graphql'

import createTypes from './types'
import createQuery from './query'
import createMutation from './mutation'
import createSubscription from './subscription'

export type Options = {
  sequelize: Sequelize,
}

export default function createSchema(options: Options): graphql.GraphQLSchema {
  const {sequelize} = options

  const types = createTypes({sequelize})

  const typesArray: Array<graphql.GraphQLNamedType> = []
  for (let key in types) typesArray.push((types[key]: any))

  return new graphql.GraphQLSchema({
    types: typesArray,
    query: createQuery({sequelize, types}),
    mutation: createMutation({sequelize, types}),
    subscription: createSubscription({sequelize, types}),
  })
}

