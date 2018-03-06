// @flow
/* @flow-runtime enable */

import {reify} from 'flow-runtime'
import type {Type} from 'flow-runtime'

export const mqttUrlPattern = new RegExp(`^(mqtts?|tcp|ssl)://[-_a-z0-9]+(\\.[-_a-z0-9]+)*(:\\d+)?$`, 'i')

export type MQTTUrl = string
export const MQTTUrlType = (reify: Type<MQTTUrl>)

MQTTUrlType.addConstraint((mqttUrl: string) => {
  if (!mqttUrlPattern.test(mqttUrl)) return 'Must be a valid MQTT URL'
})

