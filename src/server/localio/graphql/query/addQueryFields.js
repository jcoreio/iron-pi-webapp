// @flow

import * as graphql from 'graphql'
import {defaultArgs, resolver} from 'graphql-sequelize'
import requireUserId from '../../../graphql/requireUserId'
import LocalIOChannel from '../../models/LocalIOChannel'
import type {GraphQLContext} from '../../../graphql/Context'
import type {LocalIOFeature} from '../../LocalIOFeature'

const addQueryFields = (feature: LocalIOFeature) => ({types, queryFields}: {
  types: {[name: string]: graphql.GraphQLOutputType},
  queryFields: {[name: string]: graphql.GraphQLFieldConfig<any, GraphQLContext>},
}) => {
  for (let model of [LocalIOChannel]) {
    const {options} = model
    const type = types[options.name.singular]
    if (!type) continue
    queryFields[options.name.singular] = {
      type,
      args: defaultArgs(model),
      resolve: resolver(model, {before: requireUserId}),
    }
    queryFields[options.name.plural] = {
      type: new graphql.GraphQLList(type),
      args: defaultArgs(model),
      resolve: resolver(model, {before: requireUserId}),
    }
  }
}
export default addQueryFields
