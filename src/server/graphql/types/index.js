// @flow

import * as graphql from 'graphql'
import type {GraphQLOutputType, GraphQLInputType} from 'graphql'
import type Sequelize, {Model} from 'sequelize'
import mapValues from 'lodash.mapvalues'
import {defaultArgs, attributeFields} from 'graphql-sequelize'
import {associationFields} from '@jcoreio/graphql-sequelize-extra'
import models from '../../models'
import MetadataItem, {DigitalMetadataItem, NumericMetadataItem, TagDataType} from './MetadataItem'

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
    TagDataType,
    MetadataItem,
    NumericMetadataItem,
    DigitalMetadataItem,
  }
  const inputTypes: {[name: string]: GraphQLInputType} = {}

  for (let key in models) {
    const model = models[key]
    const name = model.options.name.singular
    if (types[name]) continue
    types[name] = new graphql.GraphQLObjectType({
      name,
      fields: () => ({
        ...attributeFields(model, {cache: attributeFieldsCache}),
        ...associationFields(model, {getType, getArgs}),
        ...extraFields[model.name] || {},
      })
    })

    inputTypes[name] = defaultInputType(model, {cache: attributeFieldsCache})
  }

  for (let feature of features) {
    if (feature.addTypes) feature.addTypes({sequelize, types, inputTypes, attributeFieldsCache})
  }

  return {types, inputTypes}
}
