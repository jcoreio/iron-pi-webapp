// @flow

import type {DataPluginMapping} from "../../server/data-router/PluginTypes"

export type MQTTChannelConfig = {
  internalTag: string,
  mqttTag: string,
  enabled: boolean,
  name?: ?string,
  multiplier?: ?number,
  offset?: ?number,
}

export type MQTTConfig = {
  name?: ?string,

  serverURL: string, // e.g. tcp://myhost.mydomain.com:1883
  username: string,
  password: string,
  groupId: string,
  nodeId: string,

  minPublishInterval?: ?number, // minimum interval, in milliseconds, for publishing data

  /**
   * If true, plugin will automatically publish all public tags and metadata in addition
   * to any channels defined in channelsToMQTT.
   */
  publishAllPublicTags?: ?boolean,
  channelsToMQTT?: ?Array<MQTTChannelConfig>,
  channelsFromMQTT?: ?Array<MQTTChannelConfig>,
}

/**
 * Convert any arbitrary JSON into a valid MQTTConfig
 * @param config config from JSON
 * @returns {MQTTConfig} valid MQTTConfig
 */
export function cleanMQTTConfig(config: MQTTConfig): MQTTConfig {
  // TODO: Clean
  return config
}

export function mqttConfigToDataPluginMappings(config: MQTTConfig): Array<DataPluginMapping> {
  const channelsToMQTTMappings: Array<DataPluginMapping> = (config.channelsToMQTT || [])
    // Save the array index before we filter
    .map((channel: MQTTChannelConfig, index: number) => ({
      channel,
      index
    }))
    // Filter to only enabled
    .filter((item: {channel: MQTTChannelConfig, index: number}) => item.channel.enabled)
    // Convert to DataPluginMappings
    .map((item: {channel: MQTTChannelConfig, index: number}) => ({
      id: `toMQTT${item.index + 1}`,
      name: item.channel.name || `To MQTT ${item.index + 1}`,
      tagsToPlugin: [item.channel.internalTag]
    }))
  const channelsFromMQTTMappings: Array<DataPluginMapping> = (config.channelsFromMQTT || [])
    // Save the array index before we filter
    .map((channel: MQTTChannelConfig, index: number) => ({
      channel,
      index
    }))
    // Filter to only enabled
    .filter((item: {channel: MQTTChannelConfig, index: number}) => item.channel.enabled)
    // Convert to DataPluginMappings
    .map((item: {channel: MQTTChannelConfig, index: number}) => ({
      id: `fromMQTT${item.index + 1}`,
      name: item.channel.name || `From MQTT ${item.index + 1}`,
      tagFromPlugin: item.channel.internalTag
    }))
  return [...channelsToMQTTMappings, ...channelsFromMQTTMappings]
}
