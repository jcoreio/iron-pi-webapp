// @flow

import * as graphql from 'graphql'
import type {GraphQLContext} from '../../../graphql/GraphQLContext'
import createLocalIOChannelState from './LocalIOChannelState'
import createLocalIOChannelStates from './LocalIOChannelStates'
import type {LocalIOFeature} from '../../LocalIOFeature'

const addSubscriptionFields = (feature: LocalIOFeature) => ({types, inputTypes, subscriptionFields}: {
  types: {[name: string]: graphql.GraphQLOutputType},
  subscriptionFields: {[name: string]: graphql.GraphQLFieldConfig<any, GraphQLContext>},
}) => {
  subscriptionFields.LocalIOChannelState = createLocalIOChannelState()
  subscriptionFields.LocalIOChannelStates = createLocalIOChannelStates()
}

export default addSubscriptionFields
