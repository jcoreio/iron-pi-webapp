// @flow
/* @flow-runtime enable */

import {reify} from 'flow-runtime'
import type {Type} from 'flow-runtime'
import type {MetadataItem} from '../types/MetadataItem'
import * as tags from './MQTTTags'

type DataPluginMapping = {
  id: number | string, // Unique ID, e.g. "local1"
  name: string, // Descriptive name for this input or output, e.g. "Local 1". This is distinct from the user settable metadata name, e. g. "Pump 1".
  tagsToPlugin?: ?Array<string>,
  tagFromPlugin?: ?string, // Can be null if this is an output that does not publish a tag back to the tag map
}

export type MQTTChannelConfig = {
  id: number,
  internalTag: string,
  mqttTag: string,
  enabled: boolean,
  name?: ?string,
  multiplier?: ?number,
  offset?: ?number,
  metadataItem?: MetadataItem,
}
export const MQTTChannelConfigType = (reify: Type<MQTTChannelConfig>)

export const MQTT_PROTOCOL_SPARKPLUG = 'SPARKPLUG'
export const MQTT_PROTOCOL_TEXT_JSON = 'TEXT_JSON'

export type Protocol = 'SPARKPLUG' | 'TEXT_JSON'

export const Protocols: {[protocol: Protocol]: {displayText: string}} = {
  SPARKPLUG: {displayText: 'SparkPlug'},
  TEXT_JSON: {displayText: 'Text / JSON'},
}
export const ProtocolsArray = Object.keys(Protocols)

export function getProtocolDisplayText(protocol: Protocol): string {
  return Protocols[protocol].displayText
}

export type ProtocolRequiredFields =
  {
    protocol: 'SPARKPLUG',
    groupId: string,
    nodeId: string,
  } |
  {
    protocol: 'TEXT_JSON',
    dataTopic: string,
    metadataTopic: string,
  }

export const ProtocolRequiredFieldsType = (reify: Type<ProtocolRequiredFields>)

type MQTTConfigBase = {
  id: number,
  name?: ?string,

  serverURL: string, // e.g. tcp://myhost.mydomain.com:1883
  username?: string,
  password?: string,
  protocol: Protocol,

  minPublishInterval?: ?number, // minimum interval, in milliseconds, for publishing data

  /**
   * If true, plugin will automatically publish all public tags and metadata in addition
   * to any channels defined in channelsToMQTT.
   */
  publishAllPublicTags?: ?boolean,
  channelsToMQTT?: ?Array<MQTTChannelConfig>,
  channelsFromMQTT?: ?Array<MQTTChannelConfig>,
}

export type MQTTConfigSparkPlug = MQTTConfigBase & {
  groupId?: string,
  nodeId?: string,
}

export type MQTTConfigPlainText = MQTTConfigBase & {
  dataTopic?: string,
  metadataTopic?: string,
}

export type MQTTConfig = MQTTConfigSparkPlug | MQTTConfigPlainText

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
      id: item.channel.id,
      name: item.channel.name || `To MQTT ${item.index + 1}`,
      tagsToPlugin: [item.channel.internalTag],
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
      id: item.channel.id,
      name: item.channel.name || `From MQTT ${item.index + 1}`,
      tagFromPlugin: item.channel.internalTag,
    }))
  const mqttValueChannelsMappings: Array<DataPluginMapping> = (config.channelsFromMQTT || [])
    // Save the array index before we filter
    .map((channel: MQTTChannelConfig, index: number) => ({
      channel,
      index
    }))
    // Filter to only enabled
    .filter((item: {channel: MQTTChannelConfig, index: number}) => item.channel.enabled)
    // Convert to DataPluginMappings
    .map((item: {channel: MQTTChannelConfig, index: number}) => ({
      id: `${item.channel.id}/mqttValue`,
      name: `${item.channel.id} MQTT Value`,
      tagFromPlugin: tags.mqttValue(item.channel.id),
    }))
  return [...channelsToMQTTMappings, ...channelsFromMQTTMappings, ...mqttValueChannelsMappings]
}
