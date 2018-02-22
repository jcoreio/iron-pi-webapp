// @flow

import * as graphql from 'graphql'
import setLocalChannelRemoteControlValue from './setLocalChannelRemoteControlValue'
import setLocalChannelRawInput from './setLocalChannelRawInput'
import type {Context} from '../../../graphql/Context'
import updateLocalIOChannel from './updateLocalIOChannel'
import updateLocalIOChannelCalibration from './updateLocalIOChannelCalibration'
import type {LocalIOFeature} from '../../LocalIOFeature'

const addMutationFields = (feature: LocalIOFeature) => ({types, inputTypes, mutationFields}: {
  types: {[name: string]: graphql.GraphQLOutputType},
  inputTypes: {[name: string]: graphql.GraphQLInputType},
  mutationFields: {[name: string]: graphql.GraphQLFieldConfig<any, Context>},
}) => {
  const plugin = feature._plugin
  mutationFields.setLocalChannelRemoteControlValue = setLocalChannelRemoteControlValue({plugin})
  mutationFields.setLocalChannelRawInput = setLocalChannelRawInput({plugin})
  mutationFields.updateLocalIOChannel = updateLocalIOChannel({types, inputTypes})
  mutationFields.updateLocalIOChannelCalibration = updateLocalIOChannelCalibration({types})
}
export default addMutationFields

