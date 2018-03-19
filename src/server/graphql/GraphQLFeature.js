// @flow

import type Sequelize, {Model} from 'sequelize'
import type {GraphQLInputType, GraphQLOutputType, GraphQLFieldConfig} from 'graphql'
import * as graphql from 'graphql'
import type {GraphQLContext} from './GraphQLContext'

export type GraphQLFeature = {
  +addTypes?: (options: {
    sequelize: Sequelize,
    types: {[name: string]: GraphQLOutputType},
    inputTypes: {[name: string]: GraphQLInputType},
    getType: (model: Class<Model<any>>) => GraphQLOutputType,
    getArgs: (model: Class<Model<any>>) => graphql.GraphQLFieldConfigArgumentMap,
    attributeFieldsCache: Object,
  }) => any,
  +addQueryFields?: (options: {
    sequelize: Sequelize,
    types: {[name: string]: graphql.GraphQLOutputType},
    queryFields: {[name: string]: GraphQLFieldConfig<any, GraphQLContext>},
  }) => any,
  +addMutationFields?: (options: {
    sequelize: Sequelize,
    types: {[name: string]: graphql.GraphQLOutputType},
    inputTypes: {[name: string]: graphql.GraphQLInputType},
    mutationFields: {[name: string]: GraphQLFieldConfig<any, GraphQLContext>},
  }) => any,
  +addSubscriptionFields?: (options: {
    sequelize: Sequelize,
    types: {[name: string]: graphql.GraphQLOutputType},
    subscriptionFields: {[name: string]: GraphQLFieldConfig<any, GraphQLContext>},
  }) => any,
}

