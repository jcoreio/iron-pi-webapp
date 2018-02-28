// @flow

import * as graphql from 'graphql'
import MQTTChannelConfig from '../../models/MQTTChannelConfig'
import defaultCreateType from '../../../graphql/types/defaultCreateType'

export default function createCreateMQTTChannelConfig({attributeFieldsCache}: {
  attributeFieldsCache: Object,
}): graphql.GraphQLInputObjectType {
  return defaultCreateType(MQTTChannelConfig, {
    cache: attributeFieldsCache,
  })
}

