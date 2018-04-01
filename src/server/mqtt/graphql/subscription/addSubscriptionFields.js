// @flow

import * as graphql from 'graphql'
import type {GraphQLContext} from '../../../graphql/GraphQLContext'
import type MQTTFeature from '../../MQTTFeature'
import {MQTTPluginState} from '../types/MQTTPluginState'
import {MQTT_PLUGIN_STATE_CHANGE} from './constants'

const addSubscriptionFields = (feature: MQTTFeature) => ({types, subscriptionFields}: {
  types: {[name: string]: graphql.GraphQLOutputType},
  subscriptionFields: {[name: string]: graphql.GraphQLFieldConfig<any, GraphQLContext>},
}) => {
  subscriptionFields.MQTTPluginState = {
    type: new graphql.GraphQLNonNull(MQTTPluginState),
    args: {
      id: {
        type: new graphql.GraphQLNonNull(graphql.GraphQLInt),
      },
    },
    subscribe: (doc: any, {id}: {id: number}, {userId, pubsub}: GraphQLContext) => {
      if (!userId) throw new graphql.GraphQLError('You must be logged in to subscribe to MQTTPluginStates')
      return pubsub.asyncIterator(`${MQTT_PLUGIN_STATE_CHANGE}/${id}`)
    },
  }
}
export default addSubscriptionFields

