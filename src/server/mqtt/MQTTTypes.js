// @flow

import type {MetadataItem} from '../../universal/types/MetadataItem'

export type ValuesFromMQTTMap = {
  [channelId: string]: any,
}

export type ChannelFromMQTTConfig = {
  id: number,
  internalTag: string,
  dataType: 'number' | 'string',
  multiplier?: ?number,
  offset?: ?number,
}

export type DataValueToMQTT = {
  tag: string,
  value: any,
  metadata: ?MetadataItem, // Included to help with number formatting
}

export type MetadataValueToMQTT = {
  tag: string,
  metadata: MetadataItem,
}
