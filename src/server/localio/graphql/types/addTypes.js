// @flow

import {
  AnalogInputState, DigitalChannelState, DigitalInputState, DigitalOutputState, DisabledLocalIOChannelState,
  LocalIOChannelState, LocalIOChannelIdAndState
} from './LocalIOChannelState'
import LocalIOChannel from '../../models/LocalIOChannel'
import * as graphql from 'graphql'
import createLocalIOChannelType from './LocalIOChannel'
import createInputLocalIOChannel from './InputLocalIOChannel'

export default function addTypes({types, inputTypes, attributeFieldsCache}: {
  types: {[name: string]: graphql.GraphQLOutputType},
  inputTypes: {[name: string]: graphql.GraphQLInputType},
  attributeFieldsCache: Object,
}) {
  for (let type of [
    LocalIOChannelState, DigitalChannelState,
    AnalogInputState, DigitalInputState, DigitalOutputState,
    DisabledLocalIOChannelState,
    LocalIOChannelIdAndState,
  ]) {
    types[type.name] = type
  }
  types[LocalIOChannel.options.name.singular] = createLocalIOChannelType({attributeFieldsCache})
  inputTypes.LocalIOChannel = createInputLocalIOChannel({attributeFieldsCache})
}

