// @flow

import * as graphql from 'graphql'
import MQTTConfig from '../../models/MQTTConfig'
import defaultCreateType from '../../../graphql/types/defaultCreateType'

export default function createCreateMQTTConfig({attributeFieldsCache}: {
  attributeFieldsCache: Object,
}): graphql.GraphQLInputObjectType {
  return defaultCreateType(MQTTConfig, {
    cache: attributeFieldsCache,
  })
}

