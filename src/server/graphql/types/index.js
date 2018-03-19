// @flow

import * as graphql from 'graphql'
import type Sequelize, {Model} from 'sequelize'
import mapValues from 'lodash.mapvalues'
import {defaultArgs, attributeFields} from 'graphql-sequelize'
import {associationFields} from '@jcoreio/graphql-sequelize-extra'
import models from '../../models'
import defaultCreateType from './defaultCreateType'
import defaultUpdateType from './defaultUpdateType'

export type Options = {
  sequelize: Sequelize,
}

export default function createTypes(options: Options): {[name: string]: graphql.GraphQLType} {
  const args = mapValues(models, model => defaultArgs(model))

  function getArgs(model: Class<Model<any>>): Object {
    return args[model.options.name.singular]
  }

  function getType(model: Class<Model<any>>): Object {
    return types[model.options.name.singular]
  }

  const attributeFieldsCache = {}

  const types: {[name: string]: graphql.GraphQLType} = {}

  function addType(type: graphql.GraphQLType) {
    if (typeof type.name !== 'string') throw new Error('type must have a name')
    if (!types[type.name]) types[type.name] = type
  }

  for (let key in models) {
    const model = models[key]
    const {name} = model.options
    if (types[name.singular]) continue
    addType(new graphql.GraphQLObjectType({
      name: name.singular,
      fields: () => ({
        ...attributeFields(model, {cache: attributeFieldsCache}),
        ...associationFields(model, {getType, getArgs}),
      })
    }))
    addType(defaultCreateType(model))
    addType(defaultUpdateType(model))
  }

  return types
}

