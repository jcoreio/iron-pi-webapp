// @flow

import type LocalIOChannel from './models/LocalIOChannel'
import type {LocalIOChannelState} from '../../universal/localio/LocalIOChannel'
import type {DigitalInputConfig, DigitalOutputConfig} from '../../universal/localio/LocalIOChannel'
import {INTERNAL} from '../../universal/types/Tag'

export default function getChannelState(channel: LocalIOChannel, {getTagValue}: {
  getTagValue: (tag: string) => any,
}): ?LocalIOChannelState {
  const {id, config} = channel
  switch (config.mode) {
  case 'ANALOG_INPUT': {
    return {
      mode: 'ANALOG_INPUT',
      rawInput: getTagValue(`${INTERNAL}localio/${id}/rawAnalogInput`),
      systemValue: getTagValue(`${INTERNAL}localio/${id}/systemValue`),
    }
  }
  case 'DIGITAL_INPUT': {
    const {reversePolarity}: DigitalInputConfig = (config: any)
    return {
      mode: 'DIGITAL_INPUT',
      reversePolarity,
      rawInput: getTagValue(`${INTERNAL}localio/${id}/rawDigitalInput`),
      systemValue: getTagValue(`${INTERNAL}localio/${id}/systemValue`),
    }
  }
  case 'DIGITAL_OUTPUT': {
    const {reversePolarity, safeState}: DigitalOutputConfig = (config: any)
    return {
      mode: 'DIGITAL_OUTPUT',
      reversePolarity,
      safeState,
      controlValue: getTagValue(`${INTERNAL}localio/${id}/controlValue`),
      systemValue: getTagValue(`${INTERNAL}localio/${id}/systemValue`),
      rawOutput: getTagValue(`${INTERNAL}localio/${id}/rawOutput`),
    }
  }
  case 'DISABLED': {
    return {mode: 'DISABLED', systemValue: null}
  }
  }
}

