// @flow

import type Sequelize from 'sequelize'
import * as graphql from 'graphql'
import type {GraphQLOutputType, GraphQLInputType} from 'graphql'
import setUsername from './setUsername'
import updateCalibration from './updateCalibration'
import updateChannel from './updateChannel'
import type {GraphQLFeature} from '../GraphQLFeature'

type Options = {
  sequelize: Sequelize,
  types: {[name: string]: GraphQLOutputType},
  inputTypes: {[name: string]: GraphQLInputType},
  features: Array<$Subtype<GraphQLFeature>>,
}

export default function createMutation(options: Options): graphql.GraphQLObjectType {
  const {sequelize, types, inputTypes, features} = options
  const mutationFields = {
    setUsername: setUsername({types}),
    updateCalibration: updateCalibration({types}),
    updateChannel: updateChannel({types, inputTypes}),
  }
  for (let feature of features) {
    if (feature.addMutationFields) feature.addMutationFields({sequelize, types, inputTypes, mutationFields})
  }
  return new graphql.GraphQLObjectType({
    name: 'Mutation',
    fields: mutationFields,
  })
}

