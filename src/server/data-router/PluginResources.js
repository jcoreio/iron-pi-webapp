// @flow

import type {TimestampedValuesMap} from './PluginTypes'
import type {TagMetadataMap} from '../../universal/data-router/PluginConfigTypes'

/**
 * Collection of resources made available to DataPlugins
 */
export default class PluginResources {
  _data: TimestampedValuesMap;
  _metadata: TagMetadataMap;

  constructor(args: {data: TimestampedValuesMap, metadata: TagMetadataMap}) {
    this._data = args.data
    this._metadata = args.metadata
  }

  data(): TimestampedValuesMap { return this._data }
  metadata(): TagMetadataMap { return this._metadata }
}
