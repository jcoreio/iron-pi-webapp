// @flow


import type {Model} from 'sequelize'
import * as graphql from 'graphql'
import type MQTTFeature from '../../MQTTFeature'
import MQTTConfig from '../../models/MQTTConfig'
import MQTTChannelConfig from '../../models/MQTTChannelConfig'
import createMQTTConfig from './MQTTConfig'
import createMQTTChannelConfig from './MQTTChannelConfig'
import defaultCreateType from '../../../graphql/types/defaultCreateType'
import defaultUpdateType from '../../../graphql/types/defaultUpdateType'

const addTypes = (feature: MQTTFeature) => (options: {
  types: {[name: string]: graphql.GraphQLOutputType},
  inputTypes: {[name: string]: graphql.GraphQLInputType},
  getType: (model: Class<Model<any>>) => graphql.GraphQLOutputType,
  getArgs: (model: Class<Model<any>>) => graphql.GraphQLFieldConfigArgumentMap,
  attributeFieldsCache: Object,
}) => {
  const {types, inputTypes, attributeFieldsCache: cache} = options
  for (let type of [
    createMQTTConfig(options),
    createMQTTChannelConfig(options),
  ]) {
    types[type.name] = type
  }
  for (let type of [
    defaultCreateType(MQTTConfig, {cache}),
    defaultUpdateType(MQTTConfig, {cache}),
    defaultCreateType(MQTTChannelConfig, {cache}),
    defaultUpdateType(MQTTChannelConfig, {cache}),
  ]) {
    inputTypes[type.name] = type
  }
}
export default addTypes

