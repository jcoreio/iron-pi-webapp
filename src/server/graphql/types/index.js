// @flow

import * as graphql from 'graphql'
import type {GraphQLOutputType, GraphQLInputType} from 'graphql'
import type Sequelize, {Model} from 'sequelize'
import mapValues from 'lodash.mapvalues'
import {defaultArgs, attributeFields} from 'graphql-sequelize'
import {associationFields} from '@jcoreio/graphql-sequelize-extra'

import defaultInputType from './defaultInputType'
import type DataRouter from '../../data-router/DataRouter'

import type {SyncHook} from 'tapable'

export type Options = {
  sequelize: Sequelize,
  dataRouter: DataRouter,
  hooks: {
    addTypes: SyncHook,
    addInputTypes: SyncHook,
  },
}

export default function createTypes(options: Options): {
  types: {[name: string]: GraphQLOutputType},
  inputTypes: {[name: string]: GraphQLInputType},
} {
  const {sequelize, dataRouter, hooks: {addTypes, addInputTypes}} = options
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

  const types = mapValues(models, (model: Class<Model<any>>) => new graphql.GraphQLObjectType({
    name: model.name,
    fields: () => ({
      ...attributeFields(model, {cache: attributeFieldsCache}),
      ...associationFields(model, {getType, getArgs}),
      ...extraFields[model.name] || {},
    })
  }))
  addTypes.call({sequelize, dataRouter, types})

  const inputTypes = mapValues(models, model => defaultInputType(model, {cache: attributeFieldsCache}))
  addInputTypes.call({sequelize, dataRouter, types})

  return {types, inputTypes}
}
