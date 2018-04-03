// @flow

import type Sequelize from 'sequelize'
import * as graphql from 'graphql'
import type {GraphQLOutputType, GraphQLInputType} from 'graphql'
import type {GraphQLContext} from '../GraphQLContext'
import setUsername from './setUsername'
import changePassword from './changePassword'
import createMetadataItem from './createMetadataItem'
import setSSHEnabled from './setSSHEnabled'
import setNetworkSettings from './setNetworkSettings'
import updateMetadataItem from './updateMetadataItem'
import verifyAccessCode from './verifyAccessCode'
import type {GraphQLFeature} from '../GraphQLFeature'
import defaultMutations from './defaultMutations'
import User from '../../models/User'

type Options = {
  sequelize: Sequelize,
  types: {[name: string]: GraphQLOutputType},
  inputTypes: {[name: string]: GraphQLInputType},
  features: Array<$Subtype<GraphQLFeature>>,
}

export default function createMutation(options: Options): graphql.GraphQLObjectType {
  const {sequelize, types, inputTypes, features} = options
  const mutationFields: graphql.GraphQLFieldConfigMap<any, GraphQLContext> = {
    setUsername: setUsername({types}),
    changePassword: changePassword(),
    createMetadataItem: createMetadataItem(),
    setSSHEnabled: setSSHEnabled(),
    setNetworkSettings: setNetworkSettings(),
    updateMetadataItem: updateMetadataItem(),
    verifyAccessCode: verifyAccessCode(),
  }
  if (process.env.BABEL_ENV === 'test') {
    mutationFields.setInConnectMode = require('./setInConnectMode')()
    mutationFields.setTestAccessCode = require('./setTestAccessCode')()
    Object.assign(mutationFields, defaultMutations({
      model: User,
      types,
      inputTypes,
      requireDefaultScopes: true,
    }))
  }
  for (let feature of features) {
    if (feature.addMutationFields) feature.addMutationFields({sequelize, types, inputTypes, mutationFields})
  }
  return new graphql.GraphQLObjectType({
    name: 'Mutation',
    fields: mutationFields,
  })
}

