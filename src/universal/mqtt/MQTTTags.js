// @flow
import {INTERNAL} from '../types/Tag'

export const mqttValue = (id: number) => `${INTERNAL}mqtt/channel/${id}/mqttValue`

