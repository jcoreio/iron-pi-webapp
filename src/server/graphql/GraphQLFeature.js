// @flow

import type Sequelize from 'sequelize'
import type {GraphQLInputType, GraphQLOutputType, GraphQLField} from 'graphql'
import * as graphql from 'graphql'
import type {Context} from './Context'

export type GraphQLFeature = {
  addTypes?: (options: {
    sequelize: Sequelize,
    types: {[name: string]: GraphQLOutputType},
    inputTypes: {[name: string]: GraphQLInputType},
  }) => any,
  addQueryFields?: (options: {
    sequelize: Sequelize,
    types: {[name: string]: graphql.GraphQLOutputType},
    queryFields: {[name: string]: GraphQLField<any, Context>},
  }) => any,
  addMutationFields?: (options: {
    sequelize: Sequelize,
    types: {[name: string]: graphql.GraphQLOutputType},
    inputTypes: {[name: string]: graphql.GraphQLInputType},
    mutationFields: {[name: string]: GraphQLField<any, Context>},
  }) => any,
  addSubscriptionFields?: (options: {
    sequelize: Sequelize,
    types: {[name: string]: graphql.GraphQLOutputType},
    subscriptionField: {[name: string]: GraphQLField<any, Context>},
  }) => any,
}

