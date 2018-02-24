// @flow

import type {Model} from 'sequelize'
import * as graphql from 'graphql'
import User from '../../models/User'
import {attributeFields} from 'graphql-sequelize'
import {associationFields} from '@jcoreio/graphql-sequelize-extra/lib/index'

type Options = {
  getType: (model: Class<Model<any>>) => graphql.GraphQLOutputType,
  getArgs: (model: Class<Model<any>>) => graphql.GraphQLFieldConfigArgumentMap,
  attributeFieldsCache: Object,
}

export default function createUser({
  getType,
  getArgs,
  attributeFieldsCache,
}: Options): graphql.GraphQLObjectType {
  return new graphql.GraphQLObjectType({
    name: User.options.name.singular,
    fields: () => ({
      ...attributeFields(User, {
        cache: attributeFieldsCache,
        exclude: ['password'],
      }),
      // $FlowFixMe
      ...associationFields(User, {getType, getArgs}),
    })
  })
}

