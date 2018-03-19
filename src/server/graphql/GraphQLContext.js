// @flow

import type Sequelize from 'sequelize'
import type {PubSubEngine} from 'graphql-subscriptions'

export type GraphQLDependencies = {
  pubsub: PubSubEngine,
  sequelize: Sequelize,
}

export type GraphQLContext = GraphQLDependencies & {
}

