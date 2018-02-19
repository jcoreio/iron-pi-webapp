// @flow

import {
  AnalogInputState, DigitalChannelState, DigitalInputState, DigitalOutputState, DisabledLocalIOChannelState,
  LocalIOChannelState
} from './LocalIOChannelState'
import LocalIOChannel from '../../models/LocalIOChannel'
import defaultInputType from '../../../graphql/types/defaultInputType'
import * as graphql from 'graphql'
import createLocalIOChannelType from './LocalIOChannel'

export default function addTypes({types, inputTypes, attributeFieldsCache}: {
  types: {[name: string]: graphql.GraphQLOutputType},
  inputTypes: {[name: string]: graphql.GraphQLInputType},
  attributeFieldsCache: Object,
}) {
  for (let type of [
    LocalIOChannelState, DigitalChannelState,
    AnalogInputState, DigitalInputState, DigitalOutputState,
    DisabledLocalIOChannelState,
  ]) {
    types[type.name] = type
  }
  types[LocalIOChannel.options.name.singular] = createLocalIOChannelType({attributeFieldsCache})
  inputTypes.LocalIOChannel = defaultInputType(LocalIOChannel, {cache: attributeFieldsCache})
}

