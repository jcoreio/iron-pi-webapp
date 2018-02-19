// @flow

import type Sequelize from 'sequelize'
import * as graphql from 'graphql'

import type {GraphQLFeature} from '../GraphQLFeature'
import createTagValue from './TagValue'
import createTagValues from './TagValues'

type Options = {
  sequelize: Sequelize,
  types: {[name: string]: graphql.GraphQLOutputType},
  features: Array<$Subtype<GraphQLFeature>>,
}

export default function createSubscription(options: Options): graphql.GraphQLObjectType {
  const {sequelize, types, features} = options
  const subscriptionFields = {
    TagValue: createTagValue(),
    TagValues: createTagValues(),
  }
  for (let feature of features) {
    if (feature.addSubscriptionFields) feature.addSubscriptionFields({sequelize, types, subscriptionFields})
  }
  return new graphql.GraphQLObjectType({
    name: 'Subscription',
    fields: subscriptionFields,
  })
}
