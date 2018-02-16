// @flow

import EventEmitter from '@jcoreio/typed-event-emitter'

import type {TagMetadata, TagMetadataMap} from '../../universal/data-router/PluginConfigTypes'

export const EVENT_METADATA_CHANGE = 'metadataChange'

export type MetadataChangeEvent = {metadata: TagMetadataMap}

export type MetadataHandlerEvents = {
  metadataChange: [MetadataChangeEvent],
}

export default class MetadataHandler extends EventEmitter<MetadataHandlerEvents> {
  _metadata: TagMetadataMap = {}

  constructor() {
    super()
  }

  metadata(): TagMetadataMap { return this._metadata }

  getTagMetadata(tag: string): ?TagMetadata {
    return this._metadata[tag]
  }
}

