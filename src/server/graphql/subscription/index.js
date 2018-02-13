// @flow

import type Sequelize from 'sequelize'
import * as graphql from 'graphql'

import createChannelState from './ChannelState'
import createChannelStates from './ChannelStates'
import type {GraphQLFeature} from '../GraphQLFeature'

type Options = {
  sequelize: Sequelize,
  types: {[name: string]: graphql.GraphQLOutputType},
  features: Array<$Subtype<GraphQLFeature>>,
}

export default function createSubscription(options: Options): graphql.GraphQLObjectType {
  const {sequelize, types, features} = options
  const subscriptionFields = {
    ChannelState: createChannelState(),
    ChannelStates: createChannelStates(),
  }
  for (let feature of features) {
    if (feature.addSubscriptionFields) feature.addSubscriptionFields({sequelize, types})
  }
  return new graphql.GraphQLObjectType({
    name: 'Subscription',
    fields: subscriptionFields,
  })
}
