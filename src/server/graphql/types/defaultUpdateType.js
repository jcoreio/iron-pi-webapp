// @flow

import type {Model} from 'sequelize'
import * as graphql from 'graphql'
import {attributeFieldsForUpdate} from '@jcoreio/graphql-sequelize-extra'

type Options = {
  cache?: Object,
  fields?: {
    [name: string]: graphql.GraphQLInputFieldConfig,
  },
}

export function defaultUpdateTypeName(model: Class<Model<any>>): string {
  return `Update${model.options.name.singular}`
}

export default function defaultUpdateType(
  model: Class<Model<any>>,
  options?: Options = {}
): graphql.GraphQLInputObjectType {
  const {fields = {}, ...attributeFieldsOptions} = options
  return new graphql.GraphQLInputObjectType({
    name: defaultUpdateTypeName(model),
    fields: () => ({
      ...attributeFieldsForUpdate(model, attributeFieldsOptions),
      ...fields,
    })
  })
}

