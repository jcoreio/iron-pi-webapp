// @flow
import {INTERNAL} from '../types/Tag'

export const mqttValue = (mqttTag: string) => `${INTERNAL}mqtt/tag/${mqttTag}`

