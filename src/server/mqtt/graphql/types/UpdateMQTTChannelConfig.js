// @flow

import * as graphql from 'graphql'
import MQTTChannelConfig from '../../models/MQTTChannelConfig'
import defaultUpdateType from '../../../graphql/types/defaultUpdateType'

export default function updateUpdateMQTTChannelConfig({attributeFieldsCache}: {
  attributeFieldsCache: Object,
}): graphql.GraphQLInputObjectType {
  return defaultUpdateType(MQTTChannelConfig, {
    cache: attributeFieldsCache,
  })
}

