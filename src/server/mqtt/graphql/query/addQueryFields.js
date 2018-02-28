// @flow

import * as graphql from 'graphql'
import {defaultArgs, resolver} from 'graphql-sequelize'
import requireUserId from '../../../graphql/requireUserId'
import MQTTConfig from '../../models/MQTTConfig'
import MQTTChannelConfig from '../../models/MQTTChannelConfig'
import type {GraphQLContext} from '../../../graphql/Context'
import type MQTTFeature from '../../MQTTFeature'

const addQueryFields = (feature: MQTTFeature) => ({types, queryFields}: {
  types: {[name: string]: graphql.GraphQLOutputType},
  queryFields: {[name: string]: graphql.GraphQLFieldConfig<any, GraphQLContext>},
}) => {
  for (let model of [MQTTConfig, MQTTChannelConfig]) {
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
