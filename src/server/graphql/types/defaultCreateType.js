// @flow

import type {Model} from 'sequelize'
import * as graphql from 'graphql'
import {attributeFieldsForCreate} from '@jcoreio/graphql-sequelize-extra'

type Options = {
  cache?: Object,
  fields?: {
    [name: string]: graphql.GraphQLInputFieldConfig,
  },
}

export function defaultCreateTypeName(model: Class<Model<any>>): string {
  return `Create${model.options.name.singular}`
}

export default function defaultCreateType(
  model: Class<Model<any>>,
  options?: Options = {}
): graphql.GraphQLInputObjectType {
  const {fields = {}, ...attributeFieldsOptions} = options
  return new graphql.GraphQLInputObjectType({
    name: defaultCreateTypeName(model),
    fields: () => ({
      ...attributeFieldsForCreate(model, attributeFieldsOptions),
      ...fields,
    })
  })
}

