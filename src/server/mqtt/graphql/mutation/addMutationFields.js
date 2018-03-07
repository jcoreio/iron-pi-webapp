// @flow

import * as graphql from 'graphql'
import type {GraphQLContext} from '../../../graphql/Context'
import defaultMutations from '../../../graphql/mutation/defaultMutations'
import type MQTTFeature from '../../MQTTFeature'
import SequelizeMQTTConfig from '../../models/MQTTConfig'
import SequelizeMQTTChannelConfig from '../../models/MQTTChannelConfig'
import SequelizeMetadataItem from '../../../models/MetadataItem'
import type {MQTTChannelConfig} from '../../../../universal/mqtt/MQTTConfig'

const addMutationFields = (feature: MQTTFeature) => ({types, inputTypes, mutationFields}: {
  types: {[name: string]: graphql.GraphQLOutputType},
  inputTypes: {[name: string]: graphql.GraphQLInputType},
  mutationFields: {[name: string]: graphql.GraphQLFieldConfig<any, GraphQLContext>},
}) => {
  Object.assign(mutationFields, defaultMutations({model: SequelizeMQTTConfig, types, inputTypes}))

  async function handleMetadataItem(
    source: any,
    {values}: {values: $Shape<MQTTChannelConfig>},
    context: GraphQLContext
  ): Promise<$Shape<MQTTChannelConfig>> {
    const {metadataItem, ...result} = values
    if (metadataItem) {
      const {tag} = metadataItem
      result.internalTag = tag
      const [numUpdated] = await SequelizeMetadataItem.update({item: metadataItem}, {where: {tag}, individualHooks: true})
      if (!numUpdated) await SequelizeMetadataItem.create({tag, item: metadataItem})
    }
    return result
  }

  Object.assign(mutationFields, defaultMutations({
    model: SequelizeMQTTChannelConfig,
    types,
    inputTypes,
    beforeCreate: handleMetadataItem,
    beforeUpdateOne: handleMetadataItem,
  }))
}
export default addMutationFields

