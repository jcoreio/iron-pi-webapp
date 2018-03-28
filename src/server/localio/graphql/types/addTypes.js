// @flow

import {
  AnalogInputState, DigitalChannelState, DigitalInputState, DigitalOutputState, DisabledLocalIOChannelState,
  LocalIOChannelState
} from './LocalIOChannelState'
import LocalIOChannel from '../../models/LocalIOChannel'
import * as graphql from 'graphql'
import createLocalIOChannelType from './LocalIOChannel'
import createInputLocalIOChannel from './InputLocalIOChannel'
import type {LocalIOFeature} from '../../LocalIOFeature'

const addTypes = (feature: LocalIOFeature) => ({types, inputTypes, attributeFieldsCache}: {
  types: {[name: string]: graphql.GraphQLOutputType},
  inputTypes: {[name: string]: graphql.GraphQLInputType},
  attributeFieldsCache: Object,
}) => {
  for (let type of [
    LocalIOChannelState, DigitalChannelState,
    AnalogInputState, DigitalInputState, DigitalOutputState,
    DisabledLocalIOChannelState,
  ]) {
    types[type.name] = type
  }
  types[LocalIOChannel.options.name.singular] = createLocalIOChannelType({attributeFieldsCache, types})
  inputTypes.LocalIOChannel = createInputLocalIOChannel({attributeFieldsCache})
}
export default addTypes
