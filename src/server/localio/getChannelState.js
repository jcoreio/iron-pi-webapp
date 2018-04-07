// @flow

import type LocalIOChannel from './models/LocalIOChannel'
import type {LocalIOChannelState} from '../../universal/localio/LocalIOChannel'
import type {DigitalInputConfig, DigitalOutputConfig} from '../../universal/localio/LocalIOChannel'
import * as LocalIOTags from '../../universal/localio/LocalIOTags'

export default function getChannelState(channel: LocalIOChannel, {getTagValue}: {
  getTagValue: (tag: string) => any,
}): LocalIOChannelState {
  const {id, config} = channel
  switch (config.mode) {
  case 'ANALOG_INPUT': {
    return {
      id,
      mode: 'ANALOG_INPUT',
      rawInput: getTagValue(LocalIOTags.rawAnalogInput(id)),
      systemValue: getTagValue(LocalIOTags.systemValue(id)),
    }
  }
  case 'DIGITAL_INPUT': {
    const {reversePolarity}: DigitalInputConfig = (config: any)
    return {
      id,
      mode: 'DIGITAL_INPUT',
      reversePolarity,
      rawInput: getTagValue(LocalIOTags.rawDigitalInput(id)),
      systemValue: getTagValue(LocalIOTags.systemValue(id)),
    }
  }
  case 'DIGITAL_OUTPUT': {
    const {reversePolarity, safeState}: DigitalOutputConfig = (config: any)
    return {
      id,
      mode: 'DIGITAL_OUTPUT',
      reversePolarity,
      safeState,
      controlValue: getTagValue(LocalIOTags.controlValue(id)),
      systemValue: getTagValue(LocalIOTags.systemValue(id)),
      rawOutput: getTagValue(LocalIOTags.rawOutput(id)) || 0,
    }
  }
  case 'DISABLED': {
    return {id, mode: 'DISABLED', systemValue: null}
  }
  }
  throw new Error('Unknown channel mode: ' + config.mode)
}

