// @flow

import EventEmitter from '@jcoreio/typed-event-emitter'
import {isEqual} from 'lodash'

import type {TagMetadataMap} from '../../universal/data-router/PluginConfigTypes'

export const EVENT_METADATA_CHANGE = 'metadataChange'

export type MetadataChangeEvent = {metadata: TagMetadataMap}

export type MetadataHandlerEvents = {
  metadataChange: [MetadataChangeEvent],
}

export class MetadataHandler extends EventEmitter<MetadataHandlerEvents> {
  _metadata: TagMetadataMap = {}

  constructor() {
    super()
  }

  metadata(): TagMetadataMap { return this._metadata }

  setMetadata(metadata: TagMetadataMap) {
    if (!isEqual(metadata, this._metadata)) {
      this._metadata = metadata
      this.emit(EVENT_METADATA_CHANGE, {metadata: this._metadata})
    }
  }
}

export const metadataHandler = new MetadataHandler()
