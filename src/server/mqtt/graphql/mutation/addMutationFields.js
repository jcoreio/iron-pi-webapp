// @flow

import * as graphql from 'graphql'
import type {GraphQLContext} from '../../../graphql/Context'
import type MQTTFeature from '../../MQTTFeature'
import createMQTTConfig from './createMQTTConfig'
import updateMQTTConfig from './updateMQTTConfig'
import destroyMQTTConfig from './destroyMQTTConfig'
import createMQTTChannelConfig from './createMQTTChannelConfig'
import updateMQTTChannelConfig from './updateMQTTChannelConfig'
import destroyMQTTChannelConfig from './destroyMQTTChannelConfig'

const addMutationFields = (feature: MQTTFeature) => ({types, inputTypes, mutationFields}: {
  types: {[name: string]: graphql.GraphQLOutputType},
  inputTypes: {[name: string]: graphql.GraphQLInputType},
  mutationFields: {[name: string]: graphql.GraphQLFieldConfig<any, GraphQLContext>},
}) => {
  mutationFields.createMQTTConfig = createMQTTConfig({types, inputTypes})
  mutationFields.updateMQTTConfig = updateMQTTConfig({types, inputTypes})
  mutationFields.destroyMQTTConfig = destroyMQTTConfig({types, inputTypes})
  mutationFields.createMQTTChannelConfig = createMQTTChannelConfig({types, inputTypes})
  mutationFields.updateMQTTChannelConfig = updateMQTTChannelConfig({types, inputTypes})
  mutationFields.destroyMQTTChannelConfig = destroyMQTTChannelConfig({types, inputTypes})
}
export default addMutationFields

