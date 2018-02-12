// @flow

import type {TimestampedValuesMap} from './PluginTypes'
import type {TagMetadataMap} from '../../universal/data-router/PluginConfigTypes'

import type DataRouter from './DataRouter'

/**
 * Collection of resources made available to DataPlugins
 */
export default class PluginResources {
  _dataRouter: DataRouter;
  _metadata: TagMetadataMap;

  constructor(args: {dataRouter: DataRouter, metadata: TagMetadataMap}) {
    this._dataRouter = args.dataRouter
    this._metadata = args.metadata
  }

  tagMap(): TimestampedValuesMap { return this._dataRouter.tagMap() }
  tags(): Array<string> { return this._dataRouter.tags() }
  publicTags(): Array<string> { return this._dataRouter.publicTags() }

  metadata(): TagMetadataMap { return this._metadata }
}
