// @flow

import * as graphql from 'graphql'
import {MQTTPluginStatusesArray} from '../../../../universal/types/MQTTPluginState'

const MQTTPluginStatusValues = {}
for (let status of MQTTPluginStatusesArray) {
  MQTTPluginStatusValues[status] = {value: status}
}

export const MQTTPluginStatus = new graphql.GraphQLEnumType({
  name: 'MQTTPluginStatus',
  values: MQTTPluginStatusValues,
})

export const MQTTPluginState = new graphql.GraphQLObjectType({
  name: 'MQTTPluginState',
  fields: {
    id: {
      type: new graphql.GraphQLNonNull(graphql.GraphQLInt),
    },
    status: {
      type: new graphql.GraphQLNonNull(MQTTPluginStatus),
    },
    error: {
      type: graphql.GraphQLString,
    },
    connectedSince: {
      type: graphql.GraphQLString,
    },
  },
})

