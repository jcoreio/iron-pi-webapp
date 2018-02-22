// @flow

import * as graphql from 'graphql'
import setLocalChannelRemoteControlValue from './setLocalChannelRemoteControlValue'
import type {Context} from '../../../graphql/Context'
import updateLocalIOChannel from './updateLocalIOChannel'
import updateLocalIOChannelCalibration from './updateLocalIOChannelCalibration'

export default function addMutationFields({types, inputTypes, mutationFields}: {
  types: {[name: string]: graphql.GraphQLOutputType},
  inputTypes: {[name: string]: graphql.GraphQLInputType},
  mutationFields: {[name: string]: graphql.GraphQLFieldConfig<any, Context>},
}) {
  mutationFields.setLocalChannelRemoteControlValue = setLocalChannelRemoteControlValue({plugin: this._plugin})
  mutationFields.updateLocalIOChannel = updateLocalIOChannel({types, inputTypes})
  mutationFields.updateLocalIOChannelCalibration = updateLocalIOChannelCalibration({types})
}

