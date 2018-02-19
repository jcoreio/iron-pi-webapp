// @flow

import type Sequelize from 'sequelize'
import type {GraphQLInputType, GraphQLOutputType, GraphQLFieldConfig} from 'graphql'
import * as graphql from 'graphql'
import type {Context} from './Context'

export type GraphQLFeature = {
  +addTypes?: (options: {
    sequelize: Sequelize,
    types: {[name: string]: GraphQLOutputType},
    inputTypes: {[name: string]: GraphQLInputType},
    attributeFieldsCache: Object,
  }) => any,
  +addQueryFields?: (options: {
    sequelize: Sequelize,
    types: {[name: string]: graphql.GraphQLOutputType},
    queryFields: {[name: string]: GraphQLFieldConfig<any, Context>},
  }) => any,
  +addMutationFields?: (options: {
    sequelize: Sequelize,
    types: {[name: string]: graphql.GraphQLOutputType},
    inputTypes: {[name: string]: graphql.GraphQLInputType},
    mutationFields: {[name: string]: GraphQLFieldConfig<any, Context>},
  }) => any,
  +addSubscriptionFields?: (options: {
    sequelize: Sequelize,
    types: {[name: string]: graphql.GraphQLOutputType},
    subscriptionFields: {[name: string]: GraphQLFieldConfig<any, Context>},
  }) => any,
}

