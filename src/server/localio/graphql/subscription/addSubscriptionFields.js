// @flow

import * as graphql from 'graphql'
import type {Context} from '../../../graphql/Context'
import createLocalIOChannelState from './LocalIOChannelState'
import createLocalIOChannelStates from './LocalIOChannelStates'
import type {LocalIOFeature} from '../../LocalIOFeature'

const addSubscriptionFields = (feature: LocalIOFeature) => ({types, inputTypes, subscriptionFields}: {
  types: {[name: string]: graphql.GraphQLOutputType},
  subscriptionFields: {[name: string]: graphql.GraphQLFieldConfig<any, Context>},
}) => {
  subscriptionFields.LocalIOChannelState = createLocalIOChannelState()
  subscriptionFields.LocalIOChannelStates = createLocalIOChannelStates()
}

export default addSubscriptionFields
