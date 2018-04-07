// @flow
import {INTERNAL} from '../types/Tag'

export const toMQTTValue = (pluginInstanceId: number, mqttTag: string) => `${INTERNAL}mqtt/${pluginInstanceId}/toMQTT/tag/${mqttTag}`
export const fromMQTTValue = (pluginInstanceId: number, mqttTag: string) => `${INTERNAL}mqtt/${pluginInstanceId}/fromMQTT/tag/${mqttTag}`
