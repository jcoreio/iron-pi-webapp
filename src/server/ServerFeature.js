// @flow

import type Sequelize from 'sequelize'
import type {$Application} from 'express'
import type {GraphQLSchema} from 'graphql'
import type {PubSubEngine} from 'graphql-subscriptions'
import type DataRouter from './data-router/DataRouter'
import type MetadataHandler from './metadata/MetadataHandler'
import type {GraphQLFeature} from './graphql/GraphQLFeature'
import type {Feature as DataPluginFeature} from './data-router/PluginTypes'

export type ServerFeature = {
  +getMigrations?: () => Promise<Array<string>>,
  +addSequelizeModels?: (options: {
    sequelize: Sequelize,
  }) => any,
  +seedDatabase?: (options: {
    sequelize: Sequelize,
  }) => any,
  +addPublications?: (options: {
    pubsub: PubSubEngine,
    dataRouter: DataRouter,
    metadataHandler: MetadataHandler,
  }) => any,
  +addExpressRoutes?: (options: {
    express: $Application,
    graphqlSchema: GraphQLSchema,
    dataRouter: DataRouter,
    sequelize: Sequelize,
  }) => any,
} & GraphQLFeature & DataPluginFeature

