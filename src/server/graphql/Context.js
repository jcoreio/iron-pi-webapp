// @flow

import type Sequelize from 'sequelize'
import type DataRouter from '../data-router/DataRouter'
import type {PubSubEngine} from 'graphql-subscriptions'

export type Context = {
  userId: ?number,
  scopes: ?Array<string>,
  dataRouter: DataRouter,
  pubsub: PubSubEngine,
  sequelize: Sequelize,
}

