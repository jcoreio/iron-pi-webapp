// @flow

import {Model} from 'sequelize'
import * as graphql from 'graphql'
import {createMutation, updateOneMutation, destroyMutation} from '@jcoreio/graphql-sequelize-extra'
import type {GraphQLContext} from '../Context'
import {defaultCreateTypeName} from '../types/defaultCreateType'
import {defaultUpdateTypeName} from '../types/defaultUpdateType'

type Options = {
  model: Class<Model<any>>,
  types: {[name: string]: graphql.GraphQLOutputType},
  inputTypes: {[name: string]: graphql.GraphQLInputType},
}


export default function defaultMutations(options: Options): graphql.GraphQLFieldConfigMap<any, GraphQLContext> {
  const {model, types, inputTypes} = options
  const singular = model.options.name.singular
  const plural = model.options.name.plural
  const requireLoggedIn = (source: any, args: any, {userId}: GraphQLContext) => {
    if (userId == null) {
      throw new Error(`You must be logged in to create ${plural}`)
    }
  }
  return {
    [`create${singular}`]: createMutation({
      model,
      inputType: (inputTypes[defaultCreateTypeName(model)]: any),
      returnType: (types[singular]: any),
      before: requireLoggedIn,
    }),
    [`update${singular}`]: updateOneMutation({
      model,
      inputType: (inputTypes[defaultUpdateTypeName(model)]: any),
      returnType: (types[singular]: any),
      before: requireLoggedIn,
      updateOptions: {individualHooks: true},
    }),
    [`destroy${singular}`]: destroyMutation({
      model,
      before: requireLoggedIn,
      destroyOptions: {individualHooks: true},
    }),
  }
}
