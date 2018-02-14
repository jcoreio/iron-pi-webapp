// @flow

import * as graphql from 'graphql'
import type {GraphQLOutputType, GraphQLInputType} from 'graphql'
import type Sequelize, {Model} from 'sequelize'
import mapValues from 'lodash.mapvalues'
import {defaultArgs, attributeFields} from 'graphql-sequelize'
import {associationFields} from '@jcoreio/graphql-sequelize-extra'

import TimeValuePair from './TimeValuePair'
import TaggedTimeValuePair from './TaggedTimeValuePair'
import defaultInputType from './defaultInputType'
import type {GraphQLFeature} from '../GraphQLFeature'

export type Options = {
  sequelize: Sequelize,
  features: Array<$Subtype<GraphQLFeature>>,
}

export default function createTypes(options: Options): {
  types: {[name: string]: GraphQLOutputType},
  inputTypes: {[name: string]: GraphQLInputType},
} {
  const {sequelize, features} = options
  const models = {...sequelize.models}

  const args = mapValues(models, model => defaultArgs(model))

  function getArgs(model: Class<Model<any>>): Object {
    return args[model.name]
  }

  function getType(model: Class<Model<any>>): Object {
    return types[model.name]
  }

  const extraFields = {
  }

  const attributeFieldsCache = {}

  const types: {[name: string]: GraphQLOutputType} = {
    TimeValuePair,
    TaggedTimeValuePair,
  }

  for (let key in models) {
    const model = models[key]
    types[key] = new graphql.GraphQLObjectType({
      name: model.name,
      fields: () => ({
        ...attributeFields(model, {cache: attributeFieldsCache}),
        ...associationFields(model, {getType, getArgs}),
        ...extraFields[model.name] || {},
      })
    })
  }

  const inputTypes = mapValues(models, model => defaultInputType(model, {cache: attributeFieldsCache}))

  for (let feature of features) {
    if (feature.addTypes) feature.addTypes({sequelize, types, inputTypes})
  }

  return {types, inputTypes}
}
