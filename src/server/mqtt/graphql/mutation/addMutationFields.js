// @flow

import * as graphql from 'graphql'
import type {GraphQLContext} from '../../../graphql/Context'
import defaultMutations from '../../../graphql/mutation/defaultMutations'
import type MQTTFeature from '../../MQTTFeature'
import MQTTConfig from '../../models/MQTTConfig'
import MQTTChannelConfig from '../../models/MQTTChannelConfig'

const addMutationFields = (feature: MQTTFeature) => ({types, inputTypes, mutationFields}: {
  types: {[name: string]: graphql.GraphQLOutputType},
  inputTypes: {[name: string]: graphql.GraphQLInputType},
  mutationFields: {[name: string]: graphql.GraphQLFieldConfig<any, GraphQLContext>},
}) => {
  Object.assign(mutationFields, defaultMutations({model: MQTTConfig, types, inputTypes}))
  Object.assign(mutationFields, defaultMutations({model: MQTTChannelConfig, types, inputTypes}))
}
export default addMutationFields

