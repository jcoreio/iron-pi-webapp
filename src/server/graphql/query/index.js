// @flow

import type Sequelize from 'sequelize'
import * as graphql from 'graphql'
import {defaultArgs, resolver} from 'graphql-sequelize'

import requireUserId from '../requireUserId'
import type {Context} from '../Context'
import User from '../../models/User'
import type {GraphQLFeature} from '../GraphQLFeature'
import models from '../../models'
import createTagValue from './TagValue'

type Options = {
  sequelize: Sequelize,
  types: {[name: string]: graphql.GraphQLOutputType},
  features: Array<$Subtype<GraphQLFeature>>,
}

export default function createQuery(options: Options): graphql.GraphQLObjectType {
  const {sequelize, types, features} = options

  const queryFields = {
    currentUser: {
      type: types[User.name],
      resolve: async (obj: any, args: any, context: Context): Promise<any> => {
        const {userId: id} = context
        if (id) {
          const user = await User.findOne({where: {id}})
          if (user) return user.get({plain: true, raw: true})
        }
        return null
      },
    },
    TagValue: createTagValue(),
  }

  for (let name in models) {
    switch (name) {
    case User.name:
    case 'SequelizeMeta':
      continue
    }
    const model = models[name]
    const type = types[model.options.name.singular]
    if (!type) continue

    const {options}: { options: { name: { singular: string, plural: string } } } = (model: any)

    queryFields[options.name.singular] = {
      type,
      args: defaultArgs(model),
      resolve: resolver(model, {before: requireUserId}),
    }
    queryFields[options.name.plural] = {
      type: new graphql.GraphQLList(type),
      args: defaultArgs(model),
      resolve: resolver(model, {before: requireUserId}),
    }
  }

  for (let feature of features) {
    if (feature.addQueryFields) feature.addQueryFields({sequelize, types, queryFields})
  }

  const query = new graphql.GraphQLObjectType({
    name: 'Query',
    fields: queryFields,
  })

  return query
}

