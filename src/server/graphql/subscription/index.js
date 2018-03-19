// @flow

import type Sequelize from 'sequelize'
import * as graphql from 'graphql'

type Options = {
  sequelize: Sequelize,
  types: {[name: string]: graphql.GraphQLType},
}

export default function createSubscription(options: Options): graphql.GraphQLObjectType {
  const subscriptionFields = {
  }
  return new graphql.GraphQLObjectType({
    name: 'Subscription',
    fields: subscriptionFields,
  })
}
