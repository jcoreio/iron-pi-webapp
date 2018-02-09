// @flow

import type Sequelize from 'sequelize'
import * as graphql from 'graphql'
import type {GraphQLOutputType, GraphQLInputType} from 'graphql'
import type {SyncHook} from 'tapable'
import setUsername from './setUsername'
import updateCalibration from './updateCalibration'
import updateChannel from './updateChannel'
import setChannelValues from './setChannelValues'
import setChannelValue from './setChannelValue'
import type {Store} from '../../redux/types'
import type DataRouter from '../../data-router/DataRouter'

type Options = {
  sequelize: Sequelize,
  store: Store,
  dataRouter: DataRouter,
  types: {[name: string]: GraphQLOutputType},
  inputTypes: {[name: string]: GraphQLInputType},
  hooks: {
    addMutationFields: SyncHook,
  },
}

export default function createMutation(options: Options): graphql.GraphQLObjectType {
  const {sequelize, store, dataRouter, types, inputTypes, hooks: {addMutationFields}} = options
  const mutationFields = {
    setUsername: setUsername({types}),
    updateCalibration: updateCalibration({types}),
    updateChannel: updateChannel({types, inputTypes}),
    setChannelValue: setChannelValue({store}),
    setChannelValues: setChannelValues({store}),
  }
  addMutationFields.call({sequelize, store, dataRouter, types, inputTypes, mutationFields})
  return new graphql.GraphQLObjectType({
    name: 'Mutation',
    fields: mutationFields,
  })
}

