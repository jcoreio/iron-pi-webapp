// @flow
import {INTERNAL} from '../types/Tag'

export const toMQTTValue = (mqttTag: string) => `${INTERNAL}mqtt/toMQTT/tag/${mqttTag}`
export const fromMQTTValue = (mqttTag: string) => `${INTERNAL}mqtt/fromMQTT/tag/${mqttTag}`
