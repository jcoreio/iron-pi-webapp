// @flow

import type Sequelize from 'sequelize'
import type {$Application} from 'express'
import type {GraphQLSchema} from 'graphql'
import type DataRouter from './data-router/DataRouter'
import type {GraphQLFeature} from './graphql/GraphQLFeature'
import type {Feature as DataPluginFeature} from './data-router/PluginTypes'

export type ServerFeature = {
  getMigrations?: () => Promise<Array<string>>,
  addSequelizeModels?: (options: {
    sequelize: Sequelize,
  }) => any,
  addExpressRoutes?: (options: {
    express: $Application,
    graphqlSchema: GraphQLSchema,
    dataRouter: DataRouter,
    sequelize: Sequelize,
  }) => any,
} & GraphQLFeature & DataPluginFeature

