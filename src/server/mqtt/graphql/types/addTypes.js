// @flow


import type {Model} from 'sequelize'
import * as graphql from 'graphql'
import type MQTTFeature from '../../MQTTFeature'
import createMQTTConfig from './MQTTConfig'
import createMQTTChannelConfig from './MQTTChannelConfig'
import createCreateMQTTConfig from './CreateMQTTConfig'
import createUpdateMQTTConfig from './UpdateMQTTConfig'
import createCreateMQTTChannelConfig from './CreateMQTTChannelConfig'
import createUpdateMQTTChannelConfig from './UpdateMQTTChannelConfig'

const addTypes = (feature: MQTTFeature) => (options: {
  types: {[name: string]: graphql.GraphQLOutputType},
  inputTypes: {[name: string]: graphql.GraphQLInputType},
  getType: (model: Class<Model<any>>) => graphql.GraphQLOutputType,
  getArgs: (model: Class<Model<any>>) => graphql.GraphQLFieldConfigArgumentMap,
  attributeFieldsCache: Object,
}) => {
  const {types, inputTypes} = options
  for (let type of [
    createMQTTConfig(options),
    createMQTTChannelConfig(options),
  ]) {
    types[type.name] = type
  }
  for (let type of [
    createCreateMQTTConfig(options),
    createUpdateMQTTConfig(options),
    createCreateMQTTChannelConfig(options),
    createUpdateMQTTChannelConfig(options),
  ]) {
    inputTypes[type.name] = type
  }
}
export default addTypes

