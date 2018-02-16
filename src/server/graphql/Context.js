// @flow

import type Sequelize from 'sequelize'
import type DataRouter from '../data-router/DataRouter'
import type MetadataHandler from '../metadata/MetadataHandler'
import type {PubSubEngine} from 'graphql-subscriptions'

export type Context = {
  userId: ?number,
  scopes: ?Array<string>,
  dataRouter: DataRouter,
  metadataHandler: MetadataHandler,
  pubsub: PubSubEngine,
  sequelize: Sequelize,
}

