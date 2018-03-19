// @flow

import type Sequelize from 'sequelize'
import * as graphql from 'graphql'
import {defaultArgs, resolver} from 'graphql-sequelize'

import models from '../../models'

type Options = {
  sequelize: Sequelize,
  types: {[name: string]: graphql.GraphQLType},
}

export default function createQuery(options: Options): graphql.GraphQLObjectType {
  const {types} = options

  const queryFields = {
  }

  for (let name in models) {
    const model = models[name]
    const type = types[model.options.name.singular]
    if (!type) continue

    const {options}: { options: { name: { singular: string, plural: string } } } = (model: any)

    if (!queryFields[options.name.singular]) queryFields[options.name.singular] = {
      type,
      args: defaultArgs(model),
      resolve: resolver(model),
    }
    if (!queryFields[options.name.plural]) queryFields[options.name.plural] = {
      type: new graphql.GraphQLList(type),
      args: defaultArgs(model),
      resolve: resolver(model),
    }
  }

  const query = new graphql.GraphQLObjectType({
    name: 'Query',
    fields: queryFields,
  })

  return query
}

