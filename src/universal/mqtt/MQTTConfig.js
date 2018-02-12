// @flow

import type {PluginConfig} from '../data-router/PluginConfigTypes'

export type MQTTChannelConfig = {
  internalTag: string,
  mqttTag: string,
  multiplier: number,
  offset: number,
}

export type MQTTConfig = PluginConfig & {
  serverURL: string, // e.g. tcp://myhost.mydomain.com:1883
  username: string,
  password: string,
  groupdId: string,
  nodeId: string,
  /**
   * If true, plugin will automatically publish all public tags and metadata in addition
   * to any channels defined in channelsToMQTT.
   */
  publishAllPublicTags?: ?boolean,
  channelsToMQTT: Array<MQTTChannelConfig>,
  channelsFromMQTT: Array<MQTTChannelConfig>,
}

export function validateMQTTConfig(config: PluginConfig): MQTTConfig {
  // TODO: Validate
  return (config: any)
}
