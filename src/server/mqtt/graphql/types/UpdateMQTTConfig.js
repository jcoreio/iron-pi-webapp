// @flow

import * as graphql from 'graphql'
import MQTTConfig from '../../models/MQTTConfig'
import defaultUpdateType from '../../../graphql/types/defaultUpdateType'

export default function createUpdateMQTTConfig({attributeFieldsCache}: {
  attributeFieldsCache: Object,
}): graphql.GraphQLInputObjectType {
  return defaultUpdateType(MQTTConfig, {
    cache: attributeFieldsCache,
  })
}

