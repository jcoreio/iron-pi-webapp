// @flow

import type Sequelize from 'sequelize'
import * as graphql from 'graphql'
import type {GraphQLOutputType, GraphQLInputType} from 'graphql'
import type {GraphQLContext} from '../GraphQLContext'

type Options = {
  sequelize: Sequelize,
  types: {[name: string]: graphql.GraphQLType},
}

export default function createMutation(options: Options): graphql.GraphQLObjectType {
  const mutationFields: graphql.GraphQLFieldConfigMap<any, GraphQLContext> = {
  }
  return new graphql.GraphQLObjectType({
    name: 'Mutation',
    fields: mutationFields,
  })
}

