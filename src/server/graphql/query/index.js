// @flow

import type Sequelize from 'sequelize'
import * as graphql from 'graphql'
import {defaultArgs, resolver} from 'graphql-sequelize'

import requireUserId from '../requireUserId'
import type {Context} from '../Context'
import User from '../../models/User'

type Options = {
  sequelize: Sequelize,
  types: {[name: string]: graphql.GraphQLOutputType},
}

export default function createQuery(options: Options): graphql.GraphQLObjectType {
  const {sequelize, types} = options
  const models = {...sequelize.models}

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
  }

  for (let name in models) {
    switch (name) {
    case User.name:
    case 'SequelizeMeta':
      continue
    }
    const model = models[name]
    const type = types[name]
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

  const query = new graphql.GraphQLObjectType({
    name: 'Query',
    fields: queryFields,
  })

  return query
}

